const Joi = require('joi');

const CleaningServiceValid = Joi.object({
    uid: Joi.string().required(),
    image: Joi.string().required(),
    serviceType: Joi.string().valid('CLEANING').required(),
    serviceName: Joi.string().required(),
    tasks: Joi.array().items(Joi.string()).required()
})

const HealthcareServiceValid = Joi.object({
    uid: Joi.string().required(),
    image: Joi.string().required(),
    serviceType: Joi.string().valid('HEALTHCARE').required(),
    serviceName: Joi.string().required(),
    duties: Joi.array().items(Joi.string()).required(),
    excludedTasks: Joi.array().items(Joi.string()).required()
})

const MaintenanceServiceValid = Joi.object({
    uid: Joi.string().required(),
    image: Joi.string().required(),
    serviceType: Joi.string().valid('MAINTENANCE').required(),
    serviceName: Joi.string().required(),
    powers: Joi.array().items(
        Joi.object({
            powerName: Joi.string().required(),
            quantity: Joi.number().valid(0).required(),
        })
    ).required(),
    isMaintenance: Joi.boolean().valid(false).required(),
    maintenance: Joi.string().required(),
})

module.exports = { CleaningServiceValid, HealthcareServiceValid, MaintenanceServiceValid };