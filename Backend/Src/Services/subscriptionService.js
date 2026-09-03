const Subscription = require("../Models/Subscription");

const getPlans = async (role = null) => {
  const plans = await Subscription.getAllPlans();

  if (!role) {
    return plans;
  }

  return plans.filter((plan) => plan.role === role);
};

const getPlanById = async (planId) => {
  const plan = await Subscription.getPlanById(planId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan;
};

const getUserSubscription = async (userId) => {
  return Subscription.findByUserId(userId);
};

const createFreeSubscription = async (user) => {
  const existingSubscription =
    await Subscription.findByUserId(user.id);

  if (existingSubscription) {
    return existingSubscription;
  }

  const plans = await Subscription.getAllPlans();

  const freePlanName =
    user.role === "student"
      ? "Student Free"
      : user.role === "recruiter"
      ? "Recruiter Free"
      : null;

  if (!freePlanName) {
    throw new Error("Invalid user role");
  }

  const freePlan = plans.find(
    (plan) => plan.name === freePlanName
  );

  if (!freePlan) {
    throw new Error(
      `${freePlanName} plan not found`
    );
  }

  return Subscription.create({
    userId: user.id,
    planId: freePlan.id,
    billingCycle: null,
    autoPay: false,
    status: "active",
    razorpaySubscriptionId: null,
  });
};

const validatePlanForUser = async ({
  userRole,
  planId,
  billingCycle,
}) => {
  const plan =
    await Subscription.getPlanById(planId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  if (plan.role !== userRole) {
    throw new Error(
      "This plan is not available for your account type"
    );
  }

  const isFreePlan =
    plan.name === "Student Free" ||
    plan.name === "Recruiter Free";

  if (isFreePlan) {
    return {
      plan,
      billingCycle: null,
    };
  }

  if (
    !["monthly", "yearly"].includes(
      billingCycle
    )
  ) {
    throw new Error(
      "Billing cycle must be monthly or yearly"
    );
  }

  if (
    billingCycle === "yearly" &&
    plan.price_yearly === null
  ) {
    throw new Error(
      "Yearly billing is not available for this plan"
    );
  }

  return {
    plan,
    billingCycle,
  };
};

const activateSubscription = async ({
  userId,
  userRole,
  planId,
  billingCycle,
  autoPay = false,
  razorpaySubscriptionId = null,
}) => {
  const validated =
    await validatePlanForUser({
      userRole,
      planId,
      billingCycle,
    });

  const existingSubscription =
    await Subscription.findByUserId(userId);

  if (!existingSubscription) {
    return Subscription.create({
      userId,
      planId: validated.plan.id,
      billingCycle:
        validated.billingCycle,
      autoPay,
      status: "active",
      razorpaySubscriptionId,
    });
  }

  return Subscription.updatePlan(
    userId,
    {
      planId: validated.plan.id,
      billingCycle:
        validated.billingCycle,
      autoPay,
      status: "active",
      razorpaySubscriptionId,
    }
  );
};

const updateAutoPay = async (
  userId,
  autoPay
) => {
  const subscription =
    await Subscription.findByUserId(userId);

  if (!subscription) {
    throw new Error(
      "Subscription not found"
    );
  }

  const isFreePlan =
    subscription.plan_name ===
      "Student Free" ||
    subscription.plan_name ===
      "Recruiter Free";

  // Auto-Pay can always be turned OFF
  if (autoPay === false) {
    return Subscription.updateAutoPay(
      userId,
      false
    );
  }

  // Free plans must never use Auto-Pay
  if (isFreePlan) {
    throw new Error(
      "Auto-Pay is not available for free plans"
    );
  }

  // Paid Auto-Pay requires an actual
  // Razorpay recurring subscription
  if (
    !subscription.razorpay_subscription_id
  ) {
    throw new Error(
      "Auto-Pay cannot be enabled until a Razorpay subscription is configured"
    );
  }

  return Subscription.updateAutoPay(
    userId,
    true
  );
};

const cancelSubscription = async (
  userId
) => {
  const subscription =
    await Subscription.findByUserId(userId);

  if (!subscription) {
    throw new Error(
      "Subscription not found"
    );
  }

  return Subscription.updateStatus(
    userId,
    "cancelled"
  );
};

module.exports = {
  getPlans,
  getPlanById,
  getUserSubscription,
  createFreeSubscription,
  validatePlanForUser,
  activateSubscription,
  updateAutoPay,
  cancelSubscription,
};