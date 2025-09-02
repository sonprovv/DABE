const OrderService = require("../services/OrderService");
const { failResponse, successResponse, successDataResponse } = require("../utils/response");
const { OrderCreateValid, OrderGetValid } = require("../utils/validator/OrderValid");

const createOrder = async (req, res) => {
    try {
        const rawData = req.body;
        const validated = await OrderCreateValid.validateAsync(rawData, { stripUnknown: true });

        const { worker, ...data } = validated; 
        await OrderService.createOrder({ workerID: worker.uid, ...data });
        return successResponse(res, 200, 'Thành công')
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message)
    }
}

const getOrdersByWorkerID = async (req, res) => {
    try {
        const { workerID } = req.params;

        const orders = await OrderService.getOrdersByWorkerID(workerID);

        return successDataResponse(res, 200, orders, 'orders');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message)
    }
}

const getOrdersByJobID = async (req, res) => {
    try {
        const { jobID } = req.params;

        const orders = await OrderService.getOrdersByJobID(jobID);

        return successDataResponse(res, 200, orders, 'orders');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message)
    }
}

const putByUID = async (req, res) => {
    try {
        const order = req.body;
        const validated = await OrderGetValid.validateAsync(order, { stripUnknown: true });

        const updatedOrder = await OrderService.putByUID(validated);

        return successDataResponse(res, 200, updatedOrder, 'updatedOrder');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message)
    }
}

module.exports = {
    createOrder,
    putByUID,
    getOrdersByWorkerID,
    getOrdersByJobID
};