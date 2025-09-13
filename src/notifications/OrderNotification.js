const { db, admin } = require("../config/firebase");
const { formatDateAndTimeNow } = require("../utils/formatDate");

const deleteFcmToken = async (response, clientID, devices) => {
    const tokens = [];
    for (let i = 0; i < response.responses.length; i++) {
        const res = response.responses[i];
        const validToken = devices[i];

        if (res.success) {
            tokens.push(validToken);
        }
    }
    console.log(tokens);
    await db.collection('devices').doc(clientID).update({
        devices: tokens
    })
}

const orderStatus = async (order) => {
    if (order.status!=='Completed') {
        const notify = {
            jobID: order.jobID,
            title: 'Thông báo công việc',
            content: '',
            time: null,
            serviceType: order.serviceType,
            createdAt: formatDateAndTimeNow()
        }

        if (order.status==='Accepted') {
            notify['content'] = 'Yêu cầu của bạn đã được chấp nhận';
        }
        else if (order.status==='Rejected') {
            notify['content'] = 'Yêu cầu công việc của bạn bị từ chối';
        }    
           
        const deviceDoc = await db.collection('devices').doc(order.workerID).get();
        if (!deviceDoc.exists) return;

        const devices = deviceDoc.data().devices;
        if (!devices || devices.length===0) return;

        notify['clientID'] = order.workerID;

        const message = {
            tokens: devices,
            notification: {
                title: notify.title,
                body: notify.content
            },
            data: notify
        }
        const response = await admin.messaging().sendEachForMulticast(message);
        await db.collection('notifications').add(notify);

        if (response.failureCount!==0) {
            deleteFcmToken(response, order.workerID, devices);
        }
    }
}

module.exports = { orderStatus }