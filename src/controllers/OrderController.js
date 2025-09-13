const OrderService = require("../services/OrderService");
const { failResponse, successResponse, successDataResponse } = require("../utils/response");
const { OrderCreateValid, OrderUpdateStatusValid } = require("../utils/validator/OrderValid");

const { orderStatus } = require("../notifications/OrderNotification");
const { formatDateAndTimeNow } = require("../utils/formatDate");

const createOrder = async (req, res) => {
    try {
        const rawData = req.body;
        rawData['createdAt'] = formatDateAndTimeNow();
        const validated = await OrderCreateValid.validateAsync(rawData, { stripUnknown: true });

        await OrderService.createOrder(validated);
        return successResponse(res, 200, 'Thành công')
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}

const getOrdersByWorkerID = async (req, res) => {
    try {
        const { workerID } = req.params;

        const orders = await OrderService.getOrdersByWorkerID(workerID);

        return successDataResponse(res, 200, orders, 'orders');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}

const getOrdersByJobID = async (req, res) => {
    try {
        const { jobID } = req.params;

        const orders = await OrderService.getOrdersByJobID(jobID);

        return successDataResponse(res, 200, orders, 'orders');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}

const putStatusByUID = async (req, res) => {
    try {
        const { uid, status } = req.body;

        const updatedOrder = await OrderService.putStatusByUID(uid, status);

        await orderStatus(updatedOrder);

        return successDataResponse(res, 200, updatedOrder, 'updatedOrder');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}

module.exports = {
    createOrder,
    putStatusByUID,
    getOrdersByWorkerID,
    getOrdersByJobID
};