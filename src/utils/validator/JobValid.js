const Joi = require('joi');

const JobCreateValid = Joi.object({
    user: Joi.object({
        uid: Joi.string().required(),
        username: Joi.string().required(),
        gender: Joi.string().required(),
        dob: Joi.string().required(),
        avatar: Joi.string().required(),
        email: Joi.string().email().required(),
        tel: Joi.string().required(),
        location: Joi.string().required(),
        role: Joi.string().valid('user').required()
    }).required(),
    serviceType: Joi.string().valid('CLEANING', 'HEALTHCARE').required(),
    startTime: Joi.string().required(),
    workerQuantity: Joi.number().default(1),
    isWeek: Joi.boolean().required(),
    price: Joi.number().required(),
    dayOfWeek: Joi.array().items(Joi.string().valid(
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY'
    )).min(1).required(),
    status: Joi.string().default('Active'),
})

const CleaningJobCreateValid = JobCreateValid.keys({
    duration: Joi.object({
        uid: Joi.string().required(),
        fee: Joi.number().required(),
        workingHour: Joi.number().required(),
        description: Joi.string().required()
    }),
    // options: 
    isCooking: Joi.boolean().required(),
    isIroning: Joi.boolean().required(),
    services: Joi.array().items(
        Joi.object({
            uid: Joi.string().required(),
            serviceType: Joi.string().valid('CLEANING').required(),
            serviceName: Joi.string().required(),
            image: Joi.string().required(),
            tasks: Joi.array().items(Joi.string()).required()
        })
    ).min(1).required()
})

const HealthcareJobCreateValid = JobCreateValid.keys({
    shift: Joi.object({
        uid: Joi.string().required(),
        fee: Joi.number().required(),
        workingHour: Joi.number().required()
    }),
    services: Joi.array().items(
        Joi.object({
            healthcareService: Joi.object({
                uid: Joi.string().required(),
                serviceType: Joi.string().valid('HEALTHCARE').required(),
                serviceName: Joi.string().required(),
                duties: Joi.array().items(Joi.string()).required(),
                excludedTasks: Joi.array().items(Joi.string()).required()
            }).required(),
            quantity: Joi.number().required()
        })
    ).min(1).required()
})

const CleaningJobGetvalid = CleaningJobCreateValid.keys({
    uid: Joi.string().required(),
    endTime: Joi.string().required(),
    createdAt: Joi.string().required(),
})

const HealthcareJobGetValid = HealthcareJobCreateValid.keys({
    uid: Joi.string().required(),
    endTime: Joi.string().required(),
    createdAt: Joi.string().required(),
})

module.exports = {
    CleaningJobCreateValid,
    HealthcareJobCreateValid,
    CleaningJobGetvalid,
    HealthcareJobGetValid
};