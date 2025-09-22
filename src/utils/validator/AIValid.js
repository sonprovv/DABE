const Joi = require('joi');

const AIQuestionValid = Joi.object({
    question: Joi.string().required().min(3).max(1000).messages({
        'string.empty': 'Câu hỏi không được để trống',
        'string.min': 'Câu hỏi quá ngắn',
        'string.max': 'Câu hỏi quá dài'
    })
});

module.exports = { AIQuestionValid };