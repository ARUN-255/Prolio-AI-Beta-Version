const pool = require("../Config/db");

const PaymentOrder = {
  async create({
    userId,
    planId,
    razorpayOrderId,
    billingCycle,
    amountPaise,
    currency = "INR",
  }) {
    const result = await pool.query(
      `INSERT INTO payment_orders (
        user_id,
        plan_id,
        razorpay_order_id,
        billing_cycle,
        amount_paise,
        currency
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        userId,
        planId,
        razorpayOrderId,
        billingCycle,
        amountPaise,
        currency,
      ]
    );

    return result.rows[0];
  },

  async findByRazorpayOrderId(
    razorpayOrderId
  ) {
    const result = await pool.query(
      `SELECT *
       FROM payment_orders
       WHERE razorpay_order_id = $1`,
      [razorpayOrderId]
    );

    return result.rows[0];
  },

  async findByRazorpayPaymentId(
    razorpayPaymentId
  ) {
    const result = await pool.query(
      `SELECT *
       FROM payment_orders
       WHERE razorpay_payment_id = $1`,
      [razorpayPaymentId]
    );

    return result.rows[0];
  },

  async markPaid({
    id,
    razorpayPaymentId,
  }) {
    const result = await pool.query(
      `UPDATE payment_orders
       SET
         razorpay_payment_id = $1,
         status = 'paid',
         paid_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [
        razorpayPaymentId,
        id,
      ]
    );

    return result.rows[0];
  },

  async markFailed(id) {
    const result = await pool.query(
      `UPDATE payment_orders
       SET status = 'failed'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  },
};

module.exports = PaymentOrder;