const express = require("express");

const {
  getPlans,
  getMySubscription,
  updateAutoPay,
  cancelSubscription,
} = require("../Controllers/Billing/subscriptionController");

const {
  createCheckoutOrder,
} = require("../Controllers/Billing/checkoutController");

const {
  handleRazorpayWebhook,
} = require("../Controllers/Billing/webhookController");

const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();

// Public - anyone can view pricing plans
router.get("/plans", getPlans);

// Authenticated user subscription
router.get("/subscription", protect, getMySubscription);

// Create Razorpay checkout order
router.post("/checkout", protect, createCheckoutOrder);

// Update Auto-Pay preference
router.patch("/subscription/autopay", protect, updateAutoPay);

// Cancel subscription
router.patch("/subscription/cancel", protect, cancelSubscription);

// Razorpay webhook
// IMPORTANT: raw body is required for signature verification
router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook
);

module.exports = router;