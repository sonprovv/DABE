const { db } = require("../config/firebase");
const { formatDateAndTimeNow } = require("../utils/formatDate");
const { findDevices } = require("./tool");

const orderStatusNotification = async (order) => {
    if (order.status!=='Completed') {
        const notify = {
            jobID: order.jobID,
            title: 'Thông báo ứng công việc',
            content: '',
            isRead: false,
            serviceType: order.serviceType,
            createdAt: new Date(),
            notificationType: 'Order'
        }

        if (order.status==='Accepted') {
            notify['content'] = 'Yêu cầu của bạn đã được chấp nhận';
        }
        else if (order.status==='Rejected') {
            notify['content'] = 'Yêu cầu công việc của bạn bị từ chối';
        }    

        await db.collection('notifications').add({
            ...notify,
            clientID: order.workerID
        });
           
        await findDevices(order.workerID, notify);
    }
}

module.exports = { orderStatusNotification }