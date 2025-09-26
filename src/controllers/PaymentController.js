const { failResponse, successResponse } = require("../utils/response");

const checkPayment = async (req, res) => {

    const headers = req.headers.authorization;
    const apiKey = headers.replace('Apikey ', '');
    const privateKey = 'itisapikeywhichisservingpayment';

    if (apiKey !== privateKey) {
        return failResponse(res, 401, 'Không thành công');
    }
    else {
        console.log('in');
        return successResponse(res, 200, 'Thành công');
    }
}

module.exports = {
    checkPayment,
}