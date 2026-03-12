import { prisma } from "@/app/_lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Erro na verificação do webhook:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;

          if (!userId || !subscriptionId) {
            console.warn(
              "⚠️ Missing customer or subscription in session:",
              session,
            );
            break;
          }

          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: "active",
            },
          });

          console.log(
            `✅ Subscription ${subscriptionId} activated for user ${userId}`,
          );
        }
        break;

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!subscriptionId) {
          console.warn("⚠️ Missing subscription in invoice:", invoice);
          break;
        }

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.userId;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (!userId || !customerId) {
          console.warn(
            "⚠️ Missing customer or subscription in invoice:",
            subscription,
          );
          break;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            subscriptionStatus: "active",
          },
        });

        console.log(
          `✅ Subscription ${subscriptionId} activated for user ${userId}`,
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.userId;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
        const status = subscription.status;

        // If no userId in metadata, find it by stripeCustomerId
        if (!userId && customerId) {
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: customerId },
          });
          userId = user?.id;
        }

        if (!userId) {
          console.warn("Missing userId in subscription update:", subscription);
          break;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: status,
          },
        });
        console.log(
          `Subscription ${subscription.id} status updated to ${status} for user ${userId}`,
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!subscriptionId) break;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "past_due",
          },
        });

        console.log(
          `Payment failed for subscription ${subscriptionId} (user ${userId})`,
        );
        break;
      }
      default:
        console.log(`Unhandled event:`);
    }
  } catch (error) {
    console.error("Error processing stripe event:", error);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
};
