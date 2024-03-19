const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/employeeModel');
const Leave = require('./../models/leaveModel');
// const { format } = require('date-fns');
// const moment = require('moment');

exports.applyLeave = catchAsync(async (req, res, next) => {
    const employee = await User.findById(req.user?.id)
    if (!employee) {
        return next(new AppError("Employee not found or not LoggedIn", 404))
    }
    const { leaveType, date, reason } = req.body;
    if (!leaveType || !date || !reason) {
        return next(new AppError("All fields are required", 400))
    }
    // const parsedDate = moment(date, 'DD-MM-YYYY').toDate();
    // const formattedDate = moment(parsedDate).format('DD-MM-YYYY'); 

    const existingLeave = await Leave.findOne({
        employee: employee._id,
        date: date
    })

    if (existingLeave) {
        return next(new AppError("You have already applied for leave of this date", 400));
    }
    const leave = await Leave.create({
        employee: employee._id,
        leaveType,
        date,
        reason
    })
    if (!leave) {
        return next(new AppError("Something went wrong while applying for the leave", 500))
    }
    res.status(200).json({
        status: 'success',
        data: {
            leave: leave
        }
    })
})

exports.updateLeaveStatus = catchAsync(async (req, res, next) => {
    const { leaveId, status } = req.body;
    if (!leaveId || !status) {
        return next(new AppError("Leave ID and Status required", 400));
    }
    if (status === 'Pending') {
        return next(new AppError("Cannot update leave status to pending", 400))
    }
    const leave = await Leave.findById(leaveId)
    if (!leave) {
        return next(new AppError("Leave not found", 404))
    }
    const currentEmployee = await User.findById(req.user?.id)
    leave.leaveStatus = status;
    leave.lastUpdatedBy = currentEmployee._id;
    await leave.save();
    res.status(200).json({
        status: 'success',
        data: {
            leave
        }
    })
})

exports.getAllLeaves = catchAsync(async(req,res,next)=>{
    const allLeaves = await Leave.find();
    if(!allLeaves || allLeaves === ""){
        return next(new AppError("No Leaves found in database", 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            allLeaves
        }
    })
})