const express = require("express");

const {
  getPlans,
  getMySubscription,
  updateAutoPay,
  cancelSubscription,
  resumeSubscription,
} = require(
  "../Controllers/Billing/subscriptionController"
);

const {
  createCheckoutOrder,
} = require(
  "../Controllers/Billing/checkoutController"
);

const {
  handleRazorpayWebhook,
} = require(
  "../Controllers/Billing/webhookController"
);

const {
  protect,
} = require(
  "../Middleware/authMiddleware"
);

const router = express.Router();


// ========================================
// PUBLIC PLANS
// ========================================

// Anyone can view pricing plans
router.get(
  "/plans",
  getPlans
);


// ========================================
// USER SUBSCRIPTION
// ========================================

// Get logged-in user's subscription
router.get(
  "/subscription",
  protect,
  getMySubscription
);


// ========================================
// CHECKOUT
// ========================================

// Create Razorpay checkout order
router.post(
  "/checkout",
  protect,
  createCheckoutOrder
);


// ========================================
// AUTO-PAY
// ========================================

// Update Auto-Pay preference
router.patch(
  "/subscription/autopay",
  protect,
  updateAutoPay
);


// ========================================
// CANCELLATION
// ========================================

// Schedule cancellation at period end
router.patch(
  "/subscription/cancel",
  protect,
  cancelSubscription
);

// Undo scheduled cancellation
router.patch(
  "/subscription/resume",
  protect,
  resumeSubscription
);


// ========================================
// RAZORPAY WEBHOOK
// ========================================

// IMPORTANT:
// Raw body is required for
// Razorpay signature verification.
router.post(
  "/webhook/razorpay",
  express.raw({
    type: "application/json",
  }),
  handleRazorpayWebhook
);


module.exports = router;