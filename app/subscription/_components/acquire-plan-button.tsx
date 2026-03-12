"use client";

import { Button } from "@/app/_components/ui/button";
import { createStripeCheckout } from "../_actions/create-checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";
import { createStripePortalSession } from "../_actions/create-portal-session";

const AcquirePlanButton = () => {
  const { data: session } = useSession();

  const handleAcquirePlanClick = async () => {
    const { sessionId } = await createStripeCheckout();

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error("UStripe publishable key not found");
    }
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    );

    if (!stripe) {
      throw new Error("Stripe not found");
    }
    await stripe.redirectToCheckout({ sessionId });
  };

  const handleManegerPlan = async () => {
    const response = await createStripePortalSession();
    window.location.href = response.url;
  };

  const hasPremium = session?.user?.subscriptionStatus === "active";

  if (hasPremium) {
    return (
      <Button
        className="w-full rounded-full"
        variant="outline"
        onClick={handleManegerPlan}
      >
        Gerenciar Plano
      </Button>
    );
  }
  return (
    <Button
      className="w-full rounded-full"
      onClick={handleAcquirePlanClick}
      variant="default"
    >
      Adquirir Plano
    </Button>
  );
};

export default AcquirePlanButton;
