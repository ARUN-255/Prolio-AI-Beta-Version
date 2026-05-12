const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function register(req, res) {
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  const role = req.body.role;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email password role required' });
  }
  const password_hash = bcrypt.hashSync(password, 10);
  const unique_id = 'PRO-' + Date.now();
  const query = 'INSERT INTO users (email, phone, password_hash, role, unique_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [email, phone, password_hash, role, unique_id];
  pool.query(query, values, function(err, result) {
    if (err) {
      return res.status(500).json({ message: 'Email exists or error' });
    }
    return res.status(201).json({ message: 'User registered successfully' });
  });
}

function login(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  pool.query('SELECT * FROM users WHERE email = $1', [email], function(err, result) {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = result.rows[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      role: user.role
    });
  });
}

function verifyOTP(req, res) {
  return res.json({ message: 'OTP coming soon' });
}

function forgotPassword(req, res) {
  return res.json({ message: 'Forgot password coming soon' });
}

module.exports.register = register;
module.exports.login = login;
module.exports.verifyOTP = verifyOTP;
module.exports.forgotPassword = forgotPassword;