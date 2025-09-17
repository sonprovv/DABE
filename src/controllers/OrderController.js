const OrderService = require("../services/OrderService");
const { failResponse, successResponse, successDataResponse } = require("../utils/response");
const { OrderCreateValid } = require("../utils/validator/OrderValid");

const { orderStatus } = require("../notifications/OrderNotification");
const { formatDateAndTimeNow } = require("../utils/formatDate");
const JobService = require("../services/JobService");

const createOrder = async (req, res) => {
    try {
        const rawData = req.body;

        rawData['createdAt'] = formatDateAndTimeNow();
        const validated = await OrderCreateValid.validateAsync(rawData, { stripUnknown: true });

        const checkServiceType = await JobService.checkServiceType(validated.jobID, validated.serviceType);
        if (!checkServiceType) {
            return failResponse(res, 500, `ServiceType của Job khác với ServiceType body`);
        }

        const success = await OrderService.checkOrder(validated.workerID, validated.jobID);

        if (!success) {
            return failResponse(res, 500, 'Bạn đã ứng tuyển vào công việc này!')
        }

        

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

        if (status!='Accepted' && status!='Rejected') {
            failResponse(res, 401, 'Sai trạng thái');
        }

        const updatedOrder = await OrderService.putStatusByUID(uid, status);

        console.log(updatedOrder)
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