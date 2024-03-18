const express = require('express')

const employeeRouter = require('./routes/employeeRoutes.js');
const attendanceRouter = require('./routes/attendanceRoutes.js');
const AppError = require('./utils/appError');

const app = express();
app.use(express.json())
app.use((req,res,next)=>{
    // console.log("Middleware for /api routes");
    next();
})
app.use('/api/v1/employee', employeeRouter);
app.use('/api/v1/attendance', attendanceRouter);

// app.all('*', (req,res,next)=>{
//     next(new AppError(`Can't find ${req.originalUrl} on this server`))
// })
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message
    });
});
module.exports = app;