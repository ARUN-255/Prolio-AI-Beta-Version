const Subscription = require("../Models/Subscription");


// ========================================
// HELPERS
// ========================================

const isFreePlan = (planName) => {
  return (
    planName === "Student Free" ||
    planName === "Recruiter Free"
  );
};

const getFreePlanName = (role) => {
  if (role === "student") {
    return "Student Free";
  }

  if (role === "recruiter") {
    return "Recruiter Free";
  }

  throw new Error("Invalid user role");
};


// ========================================
// GET PLANS
// ========================================

const getPlans = async (role = null) => {
  const plans =
    await Subscription.getAllPlans();

  if (!role) {
    return plans;
  }

  return plans.filter(
    (plan) => plan.role === role
  );
};


// ========================================
// GET PLAN BY ID
// ========================================

const getPlanById = async (planId) => {
  const plan =
    await Subscription.getPlanById(
      planId
    );

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan;
};


// ========================================
// HANDLE EXPIRED SUBSCRIPTION
// ========================================

const handleExpiredSubscription = async (
  subscription
) => {
  if (!subscription) {
    return null;
  }

  // Free plans never expire.
  if (
    isFreePlan(
      subscription.plan_name
    )
  ) {
    return subscription;
  }

  if (
    subscription.status !== "active"
  ) {
    return subscription;
  }

  if (
    !subscription.current_period_end
  ) {
    return subscription;
  }

  const periodEnd = new Date(
    subscription.current_period_end
  );

  if (
    Number.isNaN(
      periodEnd.getTime()
    )
  ) {
    throw new Error(
      "Invalid subscription period end"
    );
  }

  const now = new Date();

  // Paid period has not expired.
  if (periodEnd > now) {
    return subscription;
  }

  /*
   * The paid period has ended.
   *
   * Because Prolio AI currently uses
   * manual payment unless Auto-Pay is
   * explicitly configured, an expired
   * paid subscription returns to Free.
   *
   * Scheduled cancellation also reaches
   * this same path.
   */

  const freePlanName =
    getFreePlanName(
      subscription.plan_role
    );

  const plans =
    await Subscription.getAllPlans();

  const freePlan =
    plans.find(
      (plan) =>
        plan.name === freePlanName &&
        plan.role ===
          subscription.plan_role
    );

  if (!freePlan) {
    throw new Error(
      `${freePlanName} plan not found`
    );
  }

  await Subscription.downgradeToFreePlan(
    subscription.user_id,
    freePlan.id
  );

  // Fetch again so caller receives
  // Free-plan name, limits, prices, etc.
  return Subscription.findByUserId(
    subscription.user_id
  );
};


// ========================================
// GET USER SUBSCRIPTION
// ========================================

const getUserSubscription = async (
  userId
) => {
  const subscription =
    await Subscription.findByUserId(
      userId
    );

  if (!subscription) {
    return null;
  }

  return handleExpiredSubscription(
    subscription
  );
};


// ========================================
// CREATE FREE SUBSCRIPTION
// ========================================

const createFreeSubscription = async (
  user
) => {
  const existingSubscription =
    await Subscription.findByUserId(
      user.id
    );

  if (existingSubscription) {
    return handleExpiredSubscription(
      existingSubscription
    );
  }

  const plans =
    await Subscription.getAllPlans();

  const freePlanName =
    getFreePlanName(user.role);

  const freePlan =
    plans.find(
      (plan) =>
        plan.name === freePlanName &&
        plan.role === user.role
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
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });
};


// ========================================
// VALIDATE PLAN
// ========================================

const validatePlanForUser = async ({
  userRole,
  planId,
  billingCycle,
}) => {
  const plan =
    await Subscription.getPlanById(
      planId
    );

  if (!plan) {
    throw new Error("Plan not found");
  }

  if (plan.role !== userRole) {
    throw new Error(
      "This plan is not available for your account type"
    );
  }

  if (isFreePlan(plan.name)) {
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


// ========================================
// CALCULATE PAID PERIOD
// ========================================

const calculateSubscriptionPeriod = (
  billingCycle
) => {
  const start = new Date();
  const end = new Date(start);

  if (billingCycle === "monthly") {
    end.setUTCMonth(
      end.getUTCMonth() + 1
    );
  } else if (
    billingCycle === "yearly"
  ) {
    end.setUTCFullYear(
      end.getUTCFullYear() + 1
    );
  } else {
    return {
      currentPeriodStart: null,
      currentPeriodEnd: null,
    };
  }

  return {
    currentPeriodStart: start,
    currentPeriodEnd: end,
  };
};


// ========================================
// ACTIVATE SUBSCRIPTION
// ========================================

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
    await Subscription.findByUserId(
      userId
    );

  const free =
    isFreePlan(
      validated.plan.name
    );

  const period =
    free
      ? {
          currentPeriodStart: null,
          currentPeriodEnd: null,
        }
      : calculateSubscriptionPeriod(
          validated.billingCycle
        );

  if (!existingSubscription) {
    return Subscription.create({
      userId,
      planId: validated.plan.id,
      billingCycle:
        validated.billingCycle,
      autoPay,
      status: "active",
      razorpaySubscriptionId,
      currentPeriodStart:
        period.currentPeriodStart,
      currentPeriodEnd:
        period.currentPeriodEnd,
      cancelAtPeriodEnd: false,
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
      currentPeriodStart:
        period.currentPeriodStart,
      currentPeriodEnd:
        period.currentPeriodEnd,
      cancelAtPeriodEnd: false,
    }
  );
};


// ========================================
// UPDATE AUTO-PAY
// ========================================

const updateAutoPay = async (
  userId,
  autoPay
) => {
  const subscription =
    await getUserSubscription(
      userId
    );

  if (!subscription) {
    throw new Error(
      "Subscription not found"
    );
  }

  if (autoPay === false) {
    return Subscription.updateAutoPay(
      userId,
      false
    );
  }

  if (
    isFreePlan(
      subscription.plan_name
    )
  ) {
    throw new Error(
      "Auto-Pay is not available for free plans"
    );
  }

  if (
    !subscription
      .razorpay_subscription_id
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


// ========================================
// CANCEL AT PERIOD END
// ========================================

const cancelSubscription = async (
  userId
) => {
  const subscription =
    await getUserSubscription(
      userId
    );

  if (!subscription) {
    throw new Error(
      "Subscription not found"
    );
  }

  if (
    isFreePlan(
      subscription.plan_name
    )
  ) {
    throw new Error(
      "Free plans cannot be cancelled"
    );
  }

  if (
    subscription.status !== "active"
  ) {
    throw new Error(
      "Subscription is not active"
    );
  }

  if (
    subscription
      .cancel_at_period_end === true
  ) {
    return subscription;
  }

  if (
    !subscription.current_period_end
  ) {
    throw new Error(
      "Subscription period end is missing"
    );
  }

  return Subscription.scheduleCancellation(
    userId
  );
};


// ========================================
// RESUME SCHEDULED CANCELLATION
// ========================================

const resumeSubscription = async (
  userId
) => {
  const subscription =
    await getUserSubscription(
      userId
    );

  if (!subscription) {
    throw new Error(
      "Subscription not found"
    );
  }

  if (
    isFreePlan(
      subscription.plan_name
    )
  ) {
    throw new Error(
      "Free plans do not have a scheduled cancellation"
    );
  }

  if (
    subscription.status !== "active"
  ) {
    throw new Error(
      "Subscription is not active"
    );
  }

  if (
    !subscription
      .cancel_at_period_end
  ) {
    return subscription;
  }

  return Subscription.removeScheduledCancellation(
    userId
  );
};


module.exports = {
  getPlans,
  getPlanById,
  getUserSubscription,
  createFreeSubscription,
  validatePlanForUser,
  calculateSubscriptionPeriod,
  handleExpiredSubscription,
  activateSubscription,
  updateAutoPay,
  cancelSubscription,
  resumeSubscription,
};