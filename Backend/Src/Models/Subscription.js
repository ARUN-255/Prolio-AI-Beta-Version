const pool = require("../Config/db");

class Subscription {
  // ========================================
  // GET ALL PLANS
  // ========================================

  static async getAllPlans() {
    const result = await pool.query(
      `SELECT *
       FROM plans
       ORDER BY id ASC`
    );

    return result.rows;
  }


  // ========================================
  // GET PLAN BY ID
  // ========================================

  static async getPlanById(planId) {
    const result = await pool.query(
      `SELECT *
       FROM plans
       WHERE id = $1`,
      [planId]
    );

    return result.rows[0];
  }


  // ========================================
  // GET USER'S CURRENT SUBSCRIPTION
  // ========================================

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
       JOIN plans p
         ON p.id = s.plan_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    return result.rows[0];
  }


  // ========================================
  // CREATE SUBSCRIPTION
  // ========================================

  static async create({
    userId,
    planId,
    billingCycle = null,
    autoPay = false,
    status = "active",
    razorpaySubscriptionId = null,
    currentPeriodStart = null,
    currentPeriodEnd = null,
    cancelAtPeriodEnd = false,
  }) {
    const result = await pool.query(
      `INSERT INTO subscriptions (
          user_id,
          plan_id,
          billing_cycle,
          auto_pay,
          status,
          razorpay_subscription_id,
          current_period_start,
          current_period_end,
          cancel_at_period_end
       )
       VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9
       )
       RETURNING *`,
      [
        userId,
        planId,
        billingCycle,
        autoPay,
        status,
        razorpaySubscriptionId,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      ]
    );

    return result.rows[0];
  }


  // ========================================
  // UPDATE USER PLAN
  // ========================================

  static async updatePlan(
    userId,
    {
      planId,
      billingCycle = null,
      autoPay = false,
      status = "active",
      razorpaySubscriptionId = null,
      currentPeriodStart = null,
      currentPeriodEnd = null,
      cancelAtPeriodEnd = false,
    }
  ) {
    const result = await pool.query(
      `UPDATE subscriptions
       SET
          plan_id = $1,
          billing_cycle = $2,
          auto_pay = $3,
          status = $4,
          razorpay_subscription_id = $5,
          current_period_start = $6,
          current_period_end = $7,
          cancel_at_period_end = $8
       WHERE id = (
          SELECT id
          FROM subscriptions
          WHERE user_id = $9
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
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        userId,
      ]
    );

    return result.rows[0];
  }


  // ========================================
  // UPDATE AUTO-PAY
  // ========================================

  static async updateAutoPay(
    userId,
    autoPay
  ) {
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
      [
        autoPay,
        userId,
      ]
    );

    return result.rows[0];
  }


  // ========================================
  // SCHEDULE CANCELLATION
  // ========================================

  static async scheduleCancellation(
    userId
  ) {
    const result = await pool.query(
      `UPDATE subscriptions
       SET
          cancel_at_period_end = TRUE,
          auto_pay = FALSE
       WHERE id = (
          SELECT id
          FROM subscriptions
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
       )
       RETURNING *`,
      [userId]
    );

    return result.rows[0];
  }


  // ========================================
  // RESUME / REMOVE CANCELLATION
  // ========================================

  static async removeScheduledCancellation(
    userId
  ) {
    const result = await pool.query(
      `UPDATE subscriptions
       SET cancel_at_period_end = FALSE
       WHERE id = (
          SELECT id
          FROM subscriptions
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
       )
       RETURNING *`,
      [userId]
    );

    return result.rows[0];
  }


  // ========================================
  // UPDATE STATUS
  // ========================================

  static async updateStatus(
    userId,
    status
  ) {
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
      [
        status,
        userId,
      ]
    );

    return result.rows[0];
  }


  // ========================================
  // DOWNGRADE EXPIRED PAID PLAN TO FREE
  // ========================================

  static async downgradeToFreePlan(
    userId,
    freePlanId
  ) {
    const result = await pool.query(
      `UPDATE subscriptions
       SET
          plan_id = $1,
          billing_cycle = NULL,
          auto_pay = FALSE,
          status = 'active',
          razorpay_subscription_id = NULL,
          current_period_start = NULL,
          current_period_end = NULL,
          cancel_at_period_end = FALSE
       WHERE id = (
          SELECT id
          FROM subscriptions
          WHERE user_id = $2
          ORDER BY created_at DESC
          LIMIT 1
       )
       RETURNING *`,
      [
        freePlanId,
        userId,
      ]
    );

    return result.rows[0];
  }


  // ========================================
  // FIND BY RAZORPAY SUBSCRIPTION ID
  // ========================================

  static async findByRazorpaySubscriptionId(
    razorpaySubscriptionId
  ) {
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