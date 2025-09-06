const Joi = require('joi');

const UserValid = Joi.object({
    uid: Joi.string().required(),
    username: Joi.string().required(),
    gender: Joi.string().valid('Nam', 'Nữ', 'Khác').default('Nam'),
    dob: Joi.date().default(() => new Date('1990-01-01')),
    avatar: Joi.string().default('https://res.cloudinary.com/dvofgx21o/image/upload/v1754337546/jobs/byhangkho4twacw1owri.png'),
    tel: Joi.string().length(10).default('0123456789'),
    location: Joi.string().default('Chưa cập nhật'),
})

const WorkerValid = UserValid.keys({
    description: Joi.string().default('Chưa cập nhật')
})

const UserInfoValid = Joi.object({
    uid: Joi.string().required(),
    username: Joi.string().required(),
    gender: Joi.string().required(),
    dob: Joi.string().required(),
    avatar: Joi.string().required(),
    tel: Joi.string().required(),
    location: Joi.string().required(),
})

const WorkerInfoValid = UserInfoValid.keys({
    description: Joi.string().required()
})

module.exports = { 
    UserValid, 
    WorkerValid,
    UserInfoValid,
    WorkerInfoValid
};