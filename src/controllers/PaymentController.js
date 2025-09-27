const { checkPaymentNotification } = require("../notifications/PaymentNotification");
const AccountService = require("../services/AccountService");
const OrderService = require("../services/OrderService");
const PaymentService = require("../services/PaymentService");
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
        
        const des = req.body.description.split('.')[3];
        const clientID = des.substring(0, 28);
        const jobID = des.substring(28, 48);
        const serviceType = des.substring(48);
        const amount = req.body.transferAmount;
        console.log(clientID)
        console.log(jobID)
        console.log(serviceType)
        console.log(amount)

        try {
            const accountDoc = await AccountService.getByUID(clientID);
            if (accountDoc.role==='user') {
                console.log('create Payment User')
                await PaymentService.createPayment(clientID, jobID, serviceType);
            }
            else if (accountDoc.role==='worker') {
                console.log('update Payment Worker');
                await OrderService.updatePayment(clientID, jobID);
            }
            else {
                return failResponse(res, 500, 'Không cho phép');
            }

            await checkPaymentNotification(clientID, jobID, serviceType, amount);

            return successResponse(res, 200, 'Thành công');
        } catch (err) {
            console.log(err.message);
            return failResponse(res, 500, err.message);
        }
    }
}

module.exports = {
    checkPayment,
}