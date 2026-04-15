import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  premium: {
    name: "Premium",
    amount: 39900,     // in paise (₹399 * 100)
    currency: "INR",
    period: "monthly",
  },
  pro: {
    name: "Pro",
    amount: 59900,     // in paise (₹599 * 100)
    currency: "INR",
    period: "monthly",
  },
};
