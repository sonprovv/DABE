const { checkPaymentNotification } = require("../notifications/PaymentNotification");
const AccountService = require("../services/AccountService");
const PaymentService = require("../services/PaymentService");
const { failResponse } = require("../utils/response");

const checkPayment = async (req, res) => {

    const headers = req.headers.authorization;
    const apiKey = headers.replace('Apikey ', '');
    const privateKey = 'itisapikeywhichisservingpayment';

    if (apiKey !== privateKey) {
        return failResponse(res, 401, 'Không thành công');
    }
    else {
        console.log(req.body);
        
        const des = req.body.description.split('.')[3];
        const clientID = des.substring(0, 28);
        const jobID = des.substring(28, 48);
        const serviceType = des.substring(48);
        const amount = req.body.transferAmount;

        try {
            const accountDoc = await AccountService.getByUID(clientID);
            if (accountDoc.role==='user') {
                console.log('create Payment User')
                await PaymentService.createPayment(clientID, jobID, serviceType);
                await checkPaymentNotification(clientID, jobID, serviceType, amount);
            }
        } catch (err) {
            console.log(err.message);
        }
    }
}

module.exports = {
    checkPayment,
}