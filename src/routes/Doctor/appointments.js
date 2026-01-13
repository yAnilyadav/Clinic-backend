const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Appointment = require('../../models/Appointment');
const DoctorPatient = require('../../models/DoctorPatient');

// Add appointment
router.post('/', auth, async (req, res) => {
  try {
    const { patientId, visitDate, nextVisitDate } = req.body;

    // ensure patient belongs to this doctor
    const mapping = await DoctorPatient.findOne({
      where: { doctorId: req.doctorId, patientId }
    });

    if (!mapping) {
      return res.status(403).json({ error: 'Patient not linked to this doctor' });
    }

    const appointment = await Appointment.create({
      doctorId: req.doctorId,
      patientId,
      visitDate,
      nextVisitDate
    });

    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
