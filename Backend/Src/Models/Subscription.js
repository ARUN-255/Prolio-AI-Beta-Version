const pool = require("../Config/db");

class Subscription {
  // Get all available plans
  static async getAllPlans() {
    const result = await pool.query(
      `SELECT *
       FROM plans
       ORDER BY id ASC`
    );

    return result.rows;
  }

  // Get a specific plan
  static async getPlanById(planId) {
    const result = await pool.query(
      `SELECT *
       FROM plans
       WHERE id = $1`,
      [planId]
    );

    return result.rows[0];
  }

  // Get user's current subscription with plan details
  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT
          s.*,
          p.name AS plan_name,
          p.role AS plan_role,
          p.price_monthly,
          p.price_yearly,
          p.limits
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    return result.rows[0];
  }

  // Create a subscription
  static async create({
    userId,
    planId,
    billingCycle = null,
    autoPay = false,
    status = "active",
    razorpaySubscriptionId = null,
  }) {
    const result = await pool.query(
      `INSERT INTO subscriptions
        (
          user_id,
          plan_id,
          billing_cycle,
          auto_pay,
          status,
          razorpay_subscription_id
        )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        planId,
        billingCycle,
        autoPay,
        status,
        razorpaySubscriptionId,
      ]
    );

    return result.rows[0];
  }

  // Update user's plan
  static async updatePlan(
    userId,
    {
      planId,
      billingCycle = null,
      autoPay = false,
      status = "active",
      razorpaySubscriptionId = null,
    }
  ) {
    const result = await pool.query(
      `UPDATE subscriptions
       SET
          plan_id = $1,
          billing_cycle = $2,
          auto_pay = $3,
          status = $4,
          razorpay_subscription_id = $5
       WHERE id = (
          SELECT id
          FROM subscriptions
          WHERE user_id = $6
          ORDER BY created_at DESC
          LIMIT 1
       )
       RETURNING *`,
      [
        planId,
        billingCycle,
        autoPay,
        status,
        razorpaySubscriptionId,
        userId,
      ]
    );

    return result.rows[0];
  }

  // Change Auto-Pay
  static async updateAutoPay(userId, autoPay) {
    const result = await pool.query(
      `UPDATE subscriptions
       SET auto_pay = $1
       WHERE id = (
          SELECT id
          FROM subscriptions
          WHERE user_id = $2
          ORDER BY created_at DESC
          LIMIT 1
       )
       RETURNING *`,
      [autoPay, userId]
    );

    return result.rows[0];
  }

  // Update subscription status
  static async updateStatus(userId, status) {
    const result = await pool.query(
      `UPDATE subscriptions
       SET status = $1
       WHERE id = (
          SELECT id
          FROM subscriptions
          WHERE user_id = $2
          ORDER BY created_at DESC
          LIMIT 1
       )
       RETURNING *`,
      [status, userId]
    );

    return result.rows[0];
  }

  // Find subscription using Razorpay subscription ID
  static async findByRazorpaySubscriptionId(razorpaySubscriptionId) {
    const result = await pool.query(
      `SELECT *
       FROM subscriptions
       WHERE razorpay_subscription_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [razorpaySubscriptionId]
    );

    return result.rows[0];
  }
}

module.exports = Subscription;