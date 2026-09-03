const razorpay = require("../Config/razorpay");

const ensureRazorpayConfigured = () => {
  if (!razorpay) {
    throw new Error(
      "Razorpay is not configured. Add Razorpay credentials to use payments."
    );
  }
};

const createOrder = async ({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}) => {
  ensureRazorpayConfigured();

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // Rupees -> paise
    currency,
    receipt,
    notes,
  });

  return order;
};

const fetchOrder = async (orderId) => {
  ensureRazorpayConfigured();

  return razorpay.orders.fetch(orderId);
};

const fetchPayment = async (paymentId) => {
  ensureRazorpayConfigured();

  return razorpay.payments.fetch(paymentId);
};

module.exports = {
  createOrder,
  fetchOrder,
  fetchPayment,
};