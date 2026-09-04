const crypto = require("crypto");

const subscriptionService = require(
  "../../Services/subscriptionService"
);

const razorpayService = require(
  "../../Services/razorpayService"
);

const PaymentOrder = require(
  "../../Models/PaymentOrder"
);

const User = require(
  "../../Models/User"
);


// ========================================
// RAZORPAY WEBHOOK
// ========================================

const handleRazorpayWebhook = async (
  req,
  res
) => {
  try {
    // ------------------------------------
    // 1. CHECK WEBHOOK CONFIGURATION
    // ------------------------------------

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is not configured"
      );

      return res.status(503).json({
        message:
          "Payment webhook is not configured",
      });
    }


    // ------------------------------------
    // 2. GET RAZORPAY SIGNATURE
    // ------------------------------------

    const signature =
      req.headers[
        "x-razorpay-signature"
      ];

    if (!signature) {
      return res.status(400).json({
        message:
          "Missing Razorpay signature",
      });
    }


    // ------------------------------------
    // 3. REQUIRE RAW BODY
    // ------------------------------------

    if (!Buffer.isBuffer(req.body)) {
      console.error(
        "Razorpay webhook body is not a Buffer"
      );

      return res.status(400).json({
        message:
          "Invalid webhook body",
      });
    }


    // ------------------------------------
    // 4. VERIFY WEBHOOK SIGNATURE
    // ------------------------------------

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          webhookSecret
        )
        .update(req.body)
        .digest("hex");

    const receivedBuffer =
      Buffer.from(
        signature,
        "utf8"
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    if (
      receivedBuffer.length !==
        expectedBuffer.length ||
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid webhook signature",
      });
    }


    // ------------------------------------
    // 5. PARSE VERIFIED PAYLOAD
    // ------------------------------------

    let payload;

    try {
      payload =
        JSON.parse(
          req.body.toString(
            "utf8"
          )
        );
    } catch (error) {
      return res.status(400).json({
        message:
          "Invalid webhook JSON",
      });
    }

    const event =
      payload.event;


    // ------------------------------------
    // IGNORE EVENTS WE DO NOT USE
    // ------------------------------------

    if (
      event !==
      "payment.captured"
    ) {
      return res.status(200).json({
        received: true,
      });
    }


    // ====================================
    // PAYMENT CAPTURED
    // ====================================

    const payment =
      payload.payload
        ?.payment
        ?.entity;

    if (!payment) {
      return res.status(400).json({
        message:
          "Invalid payment payload",
      });
    }


    const paymentId =
      payment.id;

    const razorpayOrderId =
      payment.order_id;

    const paymentAmount =
      Number(payment.amount);

    const paymentCurrency =
      String(
        payment.currency || ""
      ).toUpperCase();


    if (
      !paymentId ||
      !razorpayOrderId
    ) {
      return res.status(400).json({
        message:
          "Payment identifiers are missing",
      });
    }


    // ------------------------------------
    // 6. DUPLICATE PAYMENT CHECK
    // ------------------------------------

    const existingPayment =
      await PaymentOrder
        .findByRazorpayPaymentId(
          paymentId
        );

    if (existingPayment) {
      console.log(
        `Duplicate webhook ignored for payment ${paymentId}`
      );

      return res.status(200).json({
        received: true,
        duplicate: true,
      });
    }


    // ------------------------------------
    // 7. FIND OUR TRUSTED LOCAL ORDER
    // ------------------------------------

    const localOrder =
      await PaymentOrder
        .findByRazorpayOrderId(
          razorpayOrderId
        );

    if (!localOrder) {
      console.error(
        "UNKNOWN RAZORPAY ORDER:",
        razorpayOrderId
      );

      return res.status(400).json({
        message:
          "Unknown payment order",
      });
    }


    // ------------------------------------
    // 8. ORDER ALREADY COMPLETED?
    // ------------------------------------

    if (
      localOrder.status ===
      "paid"
    ) {
      console.log(
        `Order ${razorpayOrderId} is already paid`
      );

      return res.status(200).json({
        received: true,
        duplicate: true,
      });
    }


    // ------------------------------------
    // 9. VERIFY PAYMENT AMOUNT
    // ------------------------------------

    if (
      paymentAmount !==
      Number(
        localOrder.amount_paise
      )
    ) {
      console.error(
        "PAYMENT AMOUNT MISMATCH:",
        {
          expected:
            localOrder.amount_paise,
          received:
            paymentAmount,
        }
      );

      return res.status(400).json({
        message:
          "Payment amount mismatch",
      });
    }


    // ------------------------------------
    // 10. VERIFY CURRENCY
    // ------------------------------------

    if (
      paymentCurrency !==
      String(
        localOrder.currency
      ).toUpperCase()
    ) {
      console.error(
        "PAYMENT CURRENCY MISMATCH"
      );

      return res.status(400).json({
        message:
          "Payment currency mismatch",
      });
    }


    // ------------------------------------
    // 11. VERIFY ORDER WITH RAZORPAY
    // ------------------------------------

    const razorpayOrder =
      await razorpayService
        .fetchOrder(
          razorpayOrderId
        );

    if (
      !razorpayOrder ||
      razorpayOrder.id !==
        razorpayOrderId
    ) {
      return res.status(400).json({
        message:
          "Unable to verify Razorpay order",
      });
    }


    if (
      Number(
        razorpayOrder.amount
      ) !==
      Number(
        localOrder.amount_paise
      )
    ) {
      return res.status(400).json({
        message:
          "Razorpay order amount mismatch",
      });
    }


    if (
      String(
        razorpayOrder.currency
      ).toUpperCase() !==
      String(
        localOrder.currency
      ).toUpperCase()
    ) {
      return res.status(400).json({
        message:
          "Razorpay order currency mismatch",
      });
    }


    // ------------------------------------
    // 12. LOAD USER FROM DATABASE
    // ------------------------------------

    const user =
      await User.findById(
        localOrder.user_id
      );

    if (!user) {
      return res.status(400).json({
        message:
          "Payment user not found",
      });
    }


    // ------------------------------------
    // 13. LOAD PLAN FROM DATABASE
    // ------------------------------------

    const plan =
      await subscriptionService
        .getPlanById(
          localOrder.plan_id
        );

    if (!plan) {
      return res.status(400).json({
        message:
          "Payment plan not found",
      });
    }


    // ------------------------------------
    // 14. VERIFY USER ROLE VS PLAN
    // ------------------------------------

    if (
      user.role !==
      plan.role
    ) {
      console.error(
        "PAYMENT ROLE MISMATCH:",
        {
          userId:
            user.id,
          userRole:
            user.role,
          planRole:
            plan.role,
        }
      );

      return res.status(400).json({
        message:
          "User is not eligible for this plan",
      });
    }


    // ------------------------------------
    // 15. VERIFY BILLING CYCLE
    // ------------------------------------

    const billingCycle =
      localOrder.billing_cycle;

    if (
      billingCycle !==
        "monthly" &&
      billingCycle !==
        "yearly"
    ) {
      return res.status(400).json({
        message:
          "Invalid billing cycle",
      });
    }


    // ------------------------------------
    // 16. VERIFY CURRENT PLAN PRICE
    // ------------------------------------

    const expectedPrice =
      billingCycle ===
      "monthly"
        ? Number(
            plan.price_monthly
          )
        : Number(
            plan.price_yearly
          );

    const expectedPaise =
      Math.round(
        expectedPrice * 100
      );

    if (
      expectedPaise !==
      Number(
        localOrder.amount_paise
      )
    ) {
      console.error(
        "PLAN PRICE MISMATCH:",
        {
          expected:
            expectedPaise,
          stored:
            localOrder.amount_paise,
        }
      );

      return res.status(400).json({
        message:
          "Stored payment amount does not match plan price",
      });
    }


    // ------------------------------------
    // 17. ACTIVATE SUBSCRIPTION
    // ------------------------------------

    await subscriptionService
      .activateSubscription({
        userId:
          user.id,

        userRole:
          user.role,

        planId:
          plan.id,

        billingCycle,

        autoPay: false,

        razorpaySubscriptionId:
          null,
      });


    // ------------------------------------
    // 18. MARK LOCAL PAYMENT AS PAID
    // ------------------------------------

    await PaymentOrder.markPaid({
      id:
        localOrder.id,

      razorpayPaymentId:
        paymentId,
    });


    console.log(
      `Payment ${paymentId} activated ${plan.name} for user ${user.id}`
    );


    return res.status(200).json({
      received: true,
    });

  } catch (error) {
    console.error(
      "RAZORPAY WEBHOOK ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Webhook processing failed",
    });
  }
};


module.exports = {
  handleRazorpayWebhook,
};