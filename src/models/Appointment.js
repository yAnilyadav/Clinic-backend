// models/Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  visitDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nextVisitDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
});

module.exports = Appointment;
