const OrderService = require("../services/OrderService");
const { failResponse, successResponse, successDataResponse } = require("../utils/response");
const { OrderCreateValid, OrderGetValid } = require("../utils/validator/OrderValid");

const userSockets = require('../notifications/userSockets');

const createOrder = async (req, res) => {
    try {
        const rawData = req.body;
        const validated = await OrderCreateValid.validateAsync(rawData, { stripUnknown: true });

        const { worker, ...data } = validated; 
        await OrderService.createOrder({ workerID: worker.uid, ...data });
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

const putByUID = async (req, res) => {
    try {
        const order = req.body;
        const validated = await OrderGetValid.validateAsync(order, { stripUnknown: true });

        const updatedOrder = await OrderService.putByUID(validated);

        const socket = userSockets.get(updatedOrder.worker.uid);
        if (socket && updatedOrder.status!=='Finished') {
            const notify = {
                jobID: updatedOrder.jobID,
                title: 'Thông báo công việc',
                content: '',
                status: updatedOrder.status
            }

            if (updatedOrder.status==='Accepted') {
                notify['content'] = 'Yêu cầu của bạn đã được chấp nhận';
            }
            else if (updatedOrder.status==='Rejected') {
                notify['content'] = 'Yêu caauf công việc của bạn bị từ chối';
            }       
            console.log(notify)    
            socket.emit('orderNotification', notify); 
        }

        return successDataResponse(res, 200, updatedOrder, 'updatedOrder');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message)
    }
}

module.exports = {
    createOrder,
    putByUID,
    getOrdersByWorkerID,
    getOrdersByJobID
};