const Joi = require('joi');

const ReviewCreateValid = Joi.object({
    userID: Joi.string().required(),
    workerID: Joi.string().required(),
    rating: Joi.number().valid(1, 2, 3, 4, 5).required(),
    comment: Joi.string().required(),
    serviceType: Joi.string().valid('CLEANING', 'HEALTHCARE').required()
})

const ReviewGetValid = ReviewCreateValid.keys({
    uid: Joi.string().required(),
})

module.exports = { ReviewCreateValid, ReviewGetValid };