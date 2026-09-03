const subscriptionService = require("../../Services/subscriptionService");
const razorpayService = require("../../Services/razorpayService");

const createCheckoutOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const { plan_id, billing_cycle } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        message: "plan_id is required",
      });
    }

    const { plan, billingCycle } =
      await subscriptionService.validatePlanForUser({
        userRole,
        planId: plan_id,
        billingCycle: billing_cycle,
      });

    const isFreePlan =
      plan.name === "Student Free" ||
      plan.name === "Recruiter Free";

    if (isFreePlan) {
      return res.status(400).json({
        message: "Free plans do not require checkout",
      });
    }

    const amount =
      billingCycle === "monthly"
        ? Number(plan.price_monthly)
        : Number(plan.price_yearly);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Invalid plan price",
      });
    }

    const receipt = `prolio_${userId}_${Date.now()}`;

    const order = await razorpayService.createOrder({
      amount,
      currency: "INR",
      receipt,
      notes: {
        user_id: String(userId),
        plan_id: String(plan.id),
        plan_name: plan.name,
        billing_cycle: billingCycle,
      },
    });

    return res.status(201).json({
      message: "Checkout order created",
      checkout: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        plan_id: plan.id,
        plan_name: plan.name,
        billing_cycle: billingCycle,
      },
    });
  } catch (error) {
    console.error("CREATE CHECKOUT ORDER ERROR:", error);

    return res.status(400).json({
      message: error.message || "Failed to create checkout order",
    });
  }
};

module.exports = {
  createCheckoutOrder,
};