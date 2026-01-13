const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Doctor = require('../../models/Doctor');
const auth = require('../../middleware/auth');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await Doctor.findOne({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const doctor = await Doctor.create({ name, email, passwordHash });

  res.json({ message: 'Doctor created', id: doctor.id });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const doctor = await Doctor.findOne({ where: { email } });
  if (!doctor) return res.status(401).json({ error: 'Invalid login' });

  const ok = await bcrypt.compare(password, doctor.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid login' });

  const token = jwt.sign({ doctorId: doctor.id }, process.env.JWT_SECRET);
  res.json({ token });
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const doctor = await Doctor.findByPk(req.doctorId);
  const ok = await bcrypt.compare(oldPassword, doctor.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Wrong password' });

  doctor.passwordHash = await bcrypt.hash(newPassword, 10);
  await doctor.save();

  res.json({ message: 'Password updated' });
});

module.exports = router;
