const { checkPaymentNotification } = require("../notifications/PaymentNotification");
const { failResponse, successResponse } = require("../utils/response");

const checkPayment = async (req, res) => {

    const headers = req.headers.authorization;
    const apiKey = headers.replace('Apikey ', '');
    const privateKey = 'itisapikeywhichisservingpayment';

    if (apiKey !== privateKey) {
        return failResponse(res, 401, 'Không thành công');
    }
    else {
        console.log(req.body);
        console.log(req.body.description.split('.')[3]);
        
        const des = req.body.description.split('.')[3];
        const [ clientID, jobID, serviceType ] = des.split('_');
        const amount = res.body.transferAmount;

        await checkPaymentNotification(clientID, jobID, serviceType, amount);

        return successResponse(res, 200, 'Thành công');
    }
}

module.exports = {
    checkPayment,
}