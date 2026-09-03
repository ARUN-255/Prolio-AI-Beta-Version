const crypto = require("crypto");
const subscriptionService = require("../../Services/subscriptionService");

const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");

      return res.status(503).json({
        message: "Payment webhook is not configured",
      });
    }

    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({
        message: "Missing Razorpay signature",
      });
    }

    /*
     * Razorpay webhook verification must use the exact raw
     * request body, not JSON.stringify(req.body).
     *
     * We will configure this route with express.raw()
     * in the next step.
     */
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return res.status(400).json({
        message: "Invalid webhook signature",
      });
    }

    const payload = JSON.parse(req.body.toString("utf8"));

    const event = payload.event;

    // Payment successfully captured
    if (event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;

      if (!payment) {
        return res.status(400).json({
          message: "Invalid payment payload",
        });
      }

      const userId = Number(payment.notes?.user_id);
      const planId = Number(payment.notes?.plan_id);
      const billingCycle = payment.notes?.billing_cycle;

      if (!userId || !planId || !billingCycle) {
        console.error("PAYMENT NOTES MISSING:", payment.id);

        return res.status(400).json({
          message: "Payment metadata is incomplete",
        });
      }

      const plan = await subscriptionService.getPlanById(planId);

      if (!plan) {
        return res.status(400).json({
          message: "Plan not found",
        });
      }

      /*
       * Do NOT trust a role sent by the payment request.
       * The plan itself tells us which account role it belongs to.
       */
      await subscriptionService.activateSubscription({
        userId,
        userRole: plan.role,
        planId,
        billingCycle,
        autoPay: false,
        razorpaySubscriptionId: null,
      });

      console.log(
        `Payment ${payment.id} activated ${plan.name} for user ${userId}`
      );
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("RAZORPAY WEBHOOK ERROR:", error);

    return res.status(500).json({
      message: "Webhook processing failed",
    });
  }
};

module.exports = {
  handleRazorpayWebhook,
};