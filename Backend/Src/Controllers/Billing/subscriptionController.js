const subscriptionService = require(
  "../../Services/subscriptionService"
);

// GET available plans
const getPlans = async (req, res) => {
  try {
    const role = req.query.role || null;

    if (
      role &&
      !["student", "recruiter"].includes(role)
    ) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const plans =
      await subscriptionService.getPlans(role);

    return res.status(200).json({
      plans,
    });
  } catch (error) {
    console.error(
      "GET PLANS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch plans",
    });
  }
};


// GET logged-in user's subscription
const getMySubscription = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    let subscription =
      await subscriptionService.getUserSubscription(
        userId
      );

    // Existing users may not yet have
    // a subscription record.
    if (!subscription) {
      await subscriptionService.createFreeSubscription(
        req.user
      );

      subscription =
        await subscriptionService.getUserSubscription(
          userId
        );
    }

    return res.status(200).json({
      subscription,
    });
  } catch (error) {
    console.error(
      "GET SUBSCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to fetch subscription",
    });
  }
};


// PATCH Auto-Pay
const updateAutoPay = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const { auto_pay } = req.body;

    if (
      typeof auto_pay !== "boolean"
    ) {
      return res.status(400).json({
        message:
          "auto_pay must be true or false",
      });
    }

    const subscription =
      await subscriptionService.updateAutoPay(
        userId,
        auto_pay
      );

    return res.status(200).json({
      message:
        "Auto-Pay updated successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "UPDATE AUTO-PAY ERROR:",
      error
    );

    return res.status(400).json({
      message:
        error.message ||
        "Failed to update Auto-Pay",
    });
  }
};


// CANCEL current paid subscription
// Access remains active until period end.
const cancelSubscription = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const subscription =
      await subscriptionService.cancelSubscription(
        userId
      );

    return res.status(200).json({
      message:
        "Subscription cancellation scheduled successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "CANCEL SUBSCRIPTION ERROR:",
      error
    );

    return res.status(400).json({
      message:
        error.message ||
        "Failed to cancel subscription",
    });
  }
};


// RESUME a scheduled cancellation
const resumeSubscription = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const subscription =
      await subscriptionService.resumeSubscription(
        userId
      );

    return res.status(200).json({
      message:
        "Subscription resumed successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "RESUME SUBSCRIPTION ERROR:",
      error
    );

    return res.status(400).json({
      message:
        error.message ||
        "Failed to resume subscription",
    });
  }
};


module.exports = {
  getPlans,
  getMySubscription,
  updateAutoPay,
  cancelSubscription,
  resumeSubscription,
};