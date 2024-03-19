const express = require('express')
const leaveController = require('./../controllers/leaveController')
const employeeController = require('./../controllers/employeeController')

const router = express.Router();

router.post('/applyLeave',employeeController.protect, leaveController.applyLeave);
router.patch('/updateLeaveStatus', employeeController.protect, employeeController.restrictTo('HR'), leaveController.updateLeaveStatus);
router.get('/getAllLeaves', employeeController.protect, employeeController.restrictTo('HR'), leaveController.getAllLeaves);

module.exports = router;