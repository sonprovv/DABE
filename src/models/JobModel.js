const Joi = require('joi');

const JobModel = Joi.object({
    workerID: Joi.string().required(),
    categoryID: Joi.string().required(),
    name: Joi.string().required(),
    des: Joi.string().default('No updated'),
    role: Joi.string().valid('technical', 'surface', 'takecare').required(),

    // role: technical
    salary: Joi.alternatives().conditional('role', {
        is: 'technical',
        then: Joi.number().min(0).required(),
        otherwise: Joi.forbidden()
    }),

    // role: surface
    acreage: Joi.alternatives().conditional('role', {
        is: 'surface',
        then: Joi.array().items(
            Joi.object({
                min: Joi.number().required(),
                max: Joi.number(),
                salary: Joi.number().required()
            })
        ),
        otherwise: Joi.forbidden()
    }),

    // role: technical and surface
    schedule: Joi.alternatives().conditional('role', {
        is: Joi.valid('technical', 'surface'),
        then: Joi.array().items(
            Joi.object({
                dayparts: Joi.string().required(),
                startTime: Joi.string().required(),
                endTime: Joi.string().required()
            })
        ),
        otherwise: Joi.forbidden()
    }),

    // role: takecare
    details: Joi.alternatives().conditional('role', {
        is: 'takecare',
        then: Joi.array().items(
            Joi.object({
                child: Joi.number().required(),    // childCareFee
                senior: Joi.number().required(),   // seniorCareFee
                disabled: Joi.number().required()  // disabilityCareFee
            })
        ),
        otherwise: Joi.forbidden()
    })
})

const JobModelWithUID = JobModel.keys({
    uid: Joi.string().required()
})

module.exports = { JobModel, JobModelWithUID };