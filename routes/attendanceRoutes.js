const express = require('express')
const attendanceController = require('./../controllers/attendanceController')
const employeeController = require('./../controllers/employeeController')

const router = express.Router();

router.post('/checkInAttendance',employeeController.protect, attendanceController.checkInAttendance);
router.patch('/checkOutAttendance',employeeController.protect, attendanceController.checkOutAttendance);
router.get('/getCurrentUserAttendance',employeeController.protect, attendanceController.getCurrentUserAttendance);
router.get('/getAttendanceByEmployeeId/:id',attendanceController.getAttendanceByEmployeeId);

module.exports = router;