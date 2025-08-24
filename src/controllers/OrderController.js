const OrderService = require("../services/OrderService");
const { failResponse, successResponse, successDataResponse } = require("../utils/response");
const { OrderCreateValid } = require("../utils/validator/OrderValid");

const createOrder = async (req, res) => {
    try {
        const rawData = req.body;
        const validated = await OrderCreateValid.validateAsync(rawData, { stripUnknown: true });

        const { worker, ...data } = validated; 
        await OrderService.createOrder({ workerID: worker.uid, ...data });
        return successResponse(res, 200, 'Thành công')
    } catch (err) {
        console.log(err.message);
        failResponse(res, 400, err.message)
    }
}

const getOrdersByWorkerID = async (req, res) => {
    try {
        const { workerID } = req.params;

        const orders = await OrderService.getOrdersByWorkerID(workerID);

        successDataResponse(res, 200, orders, 'orders');
    } catch (err) {
        console.log(err.message);
        failResponse(res, 400, err.message)
    }
}

const getOrdersByJobID = async (req, res) => {
    try {
        const { jobID } = req.params;

        const orders = await OrderService.getOrdersByJobID(jobID);

        successDataResponse(res, 200, orders, 'orders');
    } catch (err) {
        console.log(err.message);
        failResponse(res, 400, err.message)
    }
}

const putByUID = async (req, res) => {
    try {
        const { orderID, status } = req.params;

        const updatedOrder = await OrderService.putByUID(orderID, status);

        return successDataResponse(res, 200, updatedOrder, 'updatedOrder');
    } catch (err) {
        console.log(err.message);
        failResponse(res, 400, err.message)
    }
}

module.exports = {
    createOrder,
    putByUID,
    getOrdersByWorkerID,
    getOrdersByJobID
};