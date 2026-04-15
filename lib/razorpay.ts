import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  premium: {
    name: "Premium",
    amount: 2900,      // in paise (₹29 * 100) — change to your currency
    currency: "INR",
    period: "monthly",
  },
  pro: {
    name: "Pro",
    amount: 9900,      // in paise (₹99 * 100)
    currency: "INR",
    period: "monthly",
  },
};
