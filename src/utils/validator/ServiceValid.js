const Joi = require('joi');

const CleaningServiceValid = Joi.object({
    uid: Joi.string().required(),
    serviceType: Joi.string().valid('CLEANING').required(),
    serviceName: Joi.string().required(),
    image: Joi.string().required(),
    tasks: Joi.array().items(Joi.string()).required()
})

const HealthcareServiceValid = Joi.object({
    uid: Joi.string().required(),
    serviceType: Joi.string().valid('HEALTHCARE').required(),
    serviceName: Joi.string().required(),
    duties: Joi.array().items(Joi.string()).required(),
    excludedTasks: Joi.array().items(Joi.string()).required()
})

module.exports = { CleaningServiceValid, HealthcareServiceValid };