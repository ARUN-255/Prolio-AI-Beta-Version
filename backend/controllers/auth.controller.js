const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function register(req, res) {
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  const role = req.body.role;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password and role are required' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const unique_id = 'PRO-' + Date.now();

  const query = 'INSERT INTO users (email, phone, password_hash, role, unique_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [email, phone, password_hash, role, unique_id];

  pool.query(query, values, function(err, result) {
    if (err) {
      return res.status(500).json({ message: 'Email already exists or server error' });
    }
    return res.status(201).json({ message: 'User registered successfully' });
  });
}

function login(req, res) {
  res.json({ message: 'Login coming soon' });
}

function verifyOTP(req, res) {
  res.json({ message: 'OTP coming soon' });
}

function forgotPassword(req, res) {
  res.json({ message: 'Forgot password coming soon' });
}

module.exports.register = register;
module.exports.login = login;
module.exports.verifyOTP = verifyOTP;
module.exports.forgotPassword = forgotPassword;