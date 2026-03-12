"use server";

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

export const createStripePortalSession = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) throw Error("Not authenticated!");

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  if (!user?.stripeCustomerId) throw Error("Stripe Customer not found");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-10-28.acacia",
  });
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL,
  });

  return { url: portalSession.url };
};
