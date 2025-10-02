const { default: axios } = require("axios");
const { checkPaymentNotification } = require("../notifications/PaymentNotification");
const AccountService = require("../services/AccountService");
const PaymentService = require("../services/PaymentService");
const { failResponse, successDataResponse, successResponse } = require("../utils/response");
const JobService = require("../services/JobService");
const OrderService = require("../services/OrderService");

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
                await PaymentService.createPayment(clientID, jobID, amount, serviceType);
                await JobService.putStatusByUID(jobID, serviceType, 'Hiring');
                await checkPaymentNotification(clientID, jobID, serviceType, amount);
            }
        } catch (err) {
            console.log(err.message);
        }
    }
}

const checkPaymentAdmin = async (req, res) => {
    try {
        const { orderID } = req.params;
        const response = await axios.get('https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgPIlDu8jJFWOWz5PEZUhGXXVNEVdwaAetDNAjf8rVnyL49Pf87MGFMFbJvv9aHIcs7Ayj-NXpGqpGZfawFBYqz_EUbK-StTL2FSr1lTIocidFpSDaVGXTU4Ik0Yd4hWCnZcSxbJMSNf2DUr0JRIYWJdVLUtPq0EBYxQz6GnX0keTQXtFYarH97mX11cjk7YJmF7ztr3iZ4GTq4Z7snw5yz9tGO_gvzYrXR_yGB8_bDMGKH6cZqQk9vRDyDslHUPr3GOS5ww3ogscA2trZkhX3I5B4CMQ&lib=MbMul8v15srDmANSKXdW3tuQ5ZtOviKAv');
        
        console.log("Res:", response)
        const result = response.data.data;

        console.log(result)
        let orderIDDoc = result[result.length-1]['Mô tả'];

        if (orderIDDoc.includes('-')) orderIDDoc = orderIDDoc.split('-')[0];
        console.log(orderIDDoc)
        if (orderIDDoc!==orderID) return failResponse(res, 500, 'Chuyển khoản không thành công');

        await OrderService.updatePayment(orderID);

        return successResponse(res, 200, 'Thành công');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const getPayments = async (req, res) => {
    try {
        const payments = await PaymentService.getPayments();

        return successDataResponse(res, 200, payments, 'payments');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

module.exports = {
    checkPayment,
    checkPaymentAdmin,
    getPayments,
}