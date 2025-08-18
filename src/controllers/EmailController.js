const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const { auth } = require('../config/firebase');
const EmailService = require("../services/EmailService");
const { failResponse, successDataResponse } = require("../utils/response");

const sendCode = async (req, res) => {
    try {
        const { email } = req.body;

        await auth.getUserByEmail(email);

        const code = crypto.randomInt(100000, 1000000);
        
        const data = {
            user: 'ADMIN',
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: "Mã xác thực",
            text: "Mã xác thực",
            html: `Mã xác thực mật khẩu của bạn là: <b style="">${code}</b>&nbsp;.&nbsp;<div>Vui lòng <i><b>không</b></i><b><i> chia sẻ</i></b> mã xác thực này!!!</div>`,
        }

        await EmailService.sendEmail(data);

        return successDataResponse(res, 200, code.toString(), "code");
    } catch (err) {
        return failResponse(res, 400, "Không thể gửi mã xác thực");
    }
}

module.exports = {
    sendCode,
}