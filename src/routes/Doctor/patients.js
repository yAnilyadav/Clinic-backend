const express = require('express');
const auth = require('../../middleware/auth');
const Doctor = require('../../models/Doctor');
const Patient = require('../../models/Patient');
const DoctorPatient = require('../../models/DoctorPatient');
const { Op, fn, col } = require('sequelize');
const Appointment = require('../../models/Appointment');


const router = express.Router();

// Add patient with phone
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Patient name and phone number are required' });
    }

    // Create patient
    const patient = await Patient.create({ name });

    // Link patient to doctor with phone from token
    const doctor = await Doctor.findByPk(req.doctorId); // doctorId comes from auth middleware

    await doctor.addPatient(patient, {
      through: { phoneNumber: phone, isPrimary: true }
    });

    res.json({ message: 'Patient added', patient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get doctor's patients with pagination
// router.get('/', auth, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     const { count, rows } = await Patient.findAndCountAll({
//       include: {
//         model: Doctor,
//         where: { id: req.doctorId },
//         through: { attributes: ['phoneNumber', 'isPrimary'] },
//         attributes: [] // don't return doctor fields
//       },
//       order:[['createdAt','DESC']],
//       limit,
//       offset
//     });

//     res.json({
//       data: rows,
//       pagination: {
//         total: count,
//         page,
//         limit,
//         totalPages: Math.ceil(count / limit)
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 1️⃣ Fetch all patients for this doctor
    const patients = await Patient.findAll({
      include: [
        {
          model: Doctor,
          where: { id: req.doctorId },
          attributes: ['id'],
          through: { attributes: ['phoneNumber', 'createdAt'] }
        }
      ],
      order: [[Doctor, DoctorPatient, 'createdAt', 'DESC']],
      limit,
      offset
    });
    const patientIds = patients.map(p => p.id);

    // 2️⃣ Fetch latest appointment per patient
    const lastAppointments = await Appointment.findAll({
      where: {
        doctorId: req.doctorId,
        patientId: { [Op.in]: patientIds }
      },
      attributes: [
        'patientId',
        [fn('MAX', col('visitDate')), 'lastVisitDate']
      ],
      group: ['patientId']
    });

    // Map patientId → lastVisitDate
    const lastVisitMap = {};
    lastAppointments.forEach(a => {
      lastVisitMap[a.patientId] = a.get('lastVisitDate');
    });

    const today = new Date();

    const formatted = patients.map(p => {
      const lastVisit = lastVisitMap[p.id] || null;

      let daysSince = null;
      let isOverdue = false;

      if (lastVisit) {
        daysSince = Math.floor((today - new Date(lastVisit)) / (1000 * 60 * 60 * 24));
        isOverdue = daysSince > 30;
      }

      return {
        id: p.id,
        name: p.name,
        phoneNumber: p.Doctors?.[0]?.DoctorPatient?.phoneNumber || null, 
        lastVisitDate: lastVisit,
        daysSinceLastVisit: daysSince,
        isOverdue
      };
    });

    res.json({
      page,
      limit,
      total: formatted.length,
      patients: formatted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;




