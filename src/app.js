require('dotenv').config();
const express = require('express');
const sequelize = require('./config/db');

const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const DoctorPatient = require('./models/DoctorPatient');
const Appointment = require('./models/Appointment');

// Refactored routes
const doctorAuthRoutes = require('./routes/Doctor/auth');
const doctorPatientRoutes = require('./routes/Doctor/patients');
const appointmentRoutes = require('./routes/Doctor/appointments');
const reminderRoutes = require('./routes/Doctor/reminder');

const app = express();
app.use(express.json());

// Relationships
Doctor.belongsToMany(Patient, { through: DoctorPatient, foreignKey: 'doctorId' });
Patient.belongsToMany(Doctor, { through: DoctorPatient, foreignKey: 'patientId' });



Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });







DoctorPatient.belongsTo(Patient, { foreignKey: 'patientId' });
DoctorPatient.belongsTo(Doctor, { foreignKey: 'doctorId' });
Patient.hasMany(DoctorPatient, { foreignKey: 'patientId' });
Doctor.hasMany(DoctorPatient, { foreignKey: 'doctorId' });


// Routes
app.use('/api/doctor/auth', doctorAuthRoutes);
app.use('/api/doctor/patients', doctorPatientRoutes);
app.use('/api/doctor/appointments', appointmentRoutes);
app.use('/api/doctor/reminder', reminderRoutes);

// Start server
sequelize.sync().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
});
