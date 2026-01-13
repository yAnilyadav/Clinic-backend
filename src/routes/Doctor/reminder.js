const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const DoctorPatient = require('../../models/DoctorPatient');
const Patient = require('../../models/Patient');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const { sendSms } = require('../../utils/twilio');

// POST /doctor/patients/:patientId/reminder
router.post('/:patientId', auth, async (req, res) => {
  try {
    const { patientId } = req.params;

// Fetch the patient mapping along with the patient details
const mapping = await DoctorPatient.findOne({
    where: { doctorId: req.doctorId, patientId },
    include: [{ model: Patient, attributes: ['name'] }]
  });
  
  // Fetch the doctor details
  const doctor = await Doctor.findByPk(req.doctorId, { attributes: ['name'] });
  
  if (!mapping || !mapping.Patient) {
    return res.status(404).json({ error: 'Patient or Doctor details not found' });
  }
  
  const patientName = mapping.Patient.name;
  const doctorName = doctor ? doctor.name : 'Doctor';
  
  const lastAppointment = await Appointment.findOne({
    where: { doctorId: req.doctorId, patientId },
    order: [['visitDate', 'DESC']]
  });
  
  if (!lastAppointment) {
    return res.status(400).json({ error: 'No appointment found for this patient' });
  }
  
  const lastVisitDate = new Date(lastAppointment.visitDate);
  const formattedDate = lastVisitDate.toISOString().split('T')[0];
  
  const message = `Hi ${patientName}, it's time to book your next appointment with Dr. ${doctorName}. Your last visit was on ${formattedDate}.`;
  console.log(message)
  // Send SMS
  await sendSms(mapping.phoneNumber, message);
  
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
