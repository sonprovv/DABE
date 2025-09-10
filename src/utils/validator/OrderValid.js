const Joi = require('joi');

const OrderCreateValid = Joi.object({
    workerID: Joi.string().required(),
    jobID: Joi.string().required(),
    isReview: Joi.boolean().default(false),
    status: Joi.string().default('Waiting'),
    createdAt: Joi.string().required(),
    serviceType: Joi.string().valid('CLEANING', 'HEALTHCARE', 'MAINTENANCE').required()
})

const OrderGetValid = Joi.object({
    uid: Joi.string().required(),
    worker: Joi.object({
        uid: Joi.string().required(),
        username: Joi.string().required(),
        gender: Joi.string().required(),
        dob: Joi.string().required(),
        avatar: Joi.string().required(),
        email: Joi.string().email().required(),
        tel: Joi.string().required(),
        location: Joi.string().required(),
        role: Joi.string().valid('worker').required(),
        description: Joi.string().required()
    }).required(),
    jobID: Joi.string().required(),
    isReview: Joi.boolean().default(false),
    status: Joi.string().valid('Accepted', 'Rejected', 'Finished'),
    createdAt: Joi.string().required(),
    serviceType: Joi.string().valid('CLEANING', 'HEALTHCARE', 'MAINTENANCE').required(),
})

module.exports = { OrderCreateValid, OrderGetValid };