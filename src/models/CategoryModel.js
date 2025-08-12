const Joi = require('joi');

const CategoryModel = Joi.object({
    image: Joi.string().required(),
    name: Joi.string().required()
})

const CategoryModelWithUID = CategoryModel.keys({
    uid: Joi.string().required(),
})

module.exports = { CategoryModel, CategoryModelWithUID };