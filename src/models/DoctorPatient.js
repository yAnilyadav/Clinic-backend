const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DoctorPatient = sequelize.define('DoctorPatient', {
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = DoctorPatient;
