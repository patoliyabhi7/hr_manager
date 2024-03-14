const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const empSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Firstname is required'],
        index: true,
        lowercase: true
    },
    lastname: {
        type: String,
        index: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    profileImage: {
        type: String // Cloudinary URL
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 5,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm Password is required'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: "Both passwords are not same"
        }
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9]{3,30}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid Password!`,
        }
    },
    role: {
        type: String
    },
    favourite: {
        type: Boolean,
        default: false
    },
        dob: {
            type: Date,
            required: true
        }
})

empSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
})

empSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

const Employee = mongoose.model('Employee', empSchema);
module.exports = Employee