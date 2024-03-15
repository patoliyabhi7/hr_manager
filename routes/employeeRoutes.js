const express = require('express')
const employeeController = require('./../controllers/employeeController')

const router = express.Router();

router.post('/signup', employeeController.signup);
router.post('/login', employeeController.login);
router.post('/forgotPassword', employeeController.forgotPassword)
router.patch('/resetPassword/:token', employeeController.resetPassword)
router.patch('/updatePassword',employeeController.protect, employeeController.updatePassword)

module.exports = router;