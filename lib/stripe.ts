import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export const PLANS = {
  premium: {
    name: "Premium",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    price: 29,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 99,
  },
};
