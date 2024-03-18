const express = require('express')
const attendanceController = require('./../controllers/attendanceController')
const employeeController = require('./../controllers/employeeController')

const router = express.Router();

router.post('/checkInAttendance',employeeController.protect, attendanceController.checkInAttendance);
router.post('/checkOutAttendance',employeeController.protect, attendanceController.checkOutAttendance);

module.exports = router;