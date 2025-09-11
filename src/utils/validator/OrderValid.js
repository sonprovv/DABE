const Joi = require('joi');

const OrderCreateValid = Joi.object({
    workerID: Joi.string().required(),
    jobID: Joi.string().required(),
    isReview: Joi.boolean().default(false),
    status: Joi.string().default('Waiting'),
    createdAt: Joi.string().required(),
    serviceType: Joi.string().valid('CLEANING', 'HEALTHCARE', 'MAINTENANCE').required()
})

const OrderUpdateStatusValid = Joi.object({
    uid: Joi.string().required(),
    status: Joi.string().valid('Accepted', 'Rejected')
})

module.exports = { OrderCreateValid, OrderUpdateStatusValid };