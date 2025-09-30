const Joi = require('joi');

const ClientValid = Joi.object({
    uid: Joi.string().required(),
    username: Joi.string().required(),
    gender: Joi.string().valid('Nam', 'Nữ', 'Khác').default('Nam'),
    dob: Joi.date().default(() => new Date('1990-01-01')),
    avatar: Joi.string().default('https://res.cloudinary.com/dvofgx21o/image/upload/v1754337546/jobs/byhangkho4twacw1owri.png'),
    tel: Joi.string().length(10).default('0123456789'),
    location: Joi.string().default('Chưa cập nhật'),
})

const UserValid = ClientValid;
const AdminValid = ClientValid;
const WorkerValid = ClientValid.keys({
    description: Joi.string().default('Chưa cập nhật')
})

// --------------------------------------------------------------

const ClientInfoValid = Joi.object({
    uid: Joi.string().required(),
    username: Joi.string().required(),
    gender: Joi.string().required(),
    dob: Joi.string().required(),
    avatar: Joi.string().required(),
    tel: Joi.string().required(),
    location: Joi.string().required(),
    
})

const UserInfoValid = ClientInfoValid;
const AdminInfoValid = ClientInfoValid;
const WorkerInfoValid = ClientInfoValid.keys({
    description: Joi.string().required()
})

module.exports = { 
    UserValid, 
    AdminValid,
    WorkerValid,
    UserInfoValid,
    AdminInfoValid,
    WorkerInfoValid
};