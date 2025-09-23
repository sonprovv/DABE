const Joi = require('joi');

const AuthValid = Joi.object({
    role: Joi.string().valid('worker', 'user').required()
})

const ChangePasswordValid = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email không được để trống',
        'string.email': 'Không đúng định dạng email'
    }),
    newPassword: Joi.string().min(6).max(10).required().messages({
        'string.empty': 'Mật khẩu không được để trống',
        'string.min': 'Mật khấu nhỏ hơn 6 ký tự',
        'string.max': 'Mật khẩu dài hơn 10 ký tự'
    }),

    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Mật khẩu không khớp',
            'string.empty': 'Xác nhận mật khẩu không để trống'
        }),
})

const ForgotPasswordValid = ChangePasswordValid.keys({
    code: Joi.string().length(6).required().messages({
        'string.length': 'Lỗi mã xác thực vui lòng thử lại',
        'string.empty': 'Lỗi mã xác thực vui lòng thử lại'
    }),
    codeEnter: Joi.string().valid(Joi.ref('code')).length(6).required().messages({
        'any.only': 'Mã xác nhận không trùng khớp',
        'string.length': 'Mã xác nhận phải đúng 6 ký tự',
        'string.empty': 'Mã xác thực không được để trống'
    }),
})


module.exports = { AuthValid, ChangePasswordValid, ForgotPasswordValid };