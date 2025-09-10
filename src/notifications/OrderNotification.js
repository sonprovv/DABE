const { db, admin } = require("../config/firebase");

const orderStatus = async (order) => {
    if (order.status!=='Finished') {
        const notify = {
            jobID: order.jobID,
            title: 'Thông báo công việc',
            content: '',
            time: null,
            serviceType: order.serviceType,
            createdAt: formatDateAndTimeNow()
        }

        if (updatedOrder.status==='Accepted') {
            notify['content'] = 'Yêu cầu của bạn đã được chấp nhận';
        }
        else if (updatedOrder.status==='Rejected') {
            notify['content'] = 'Yêu cầu công việc của bạn bị từ chối';
        }       
        console.log(notify)    
        
        const deviceDoc = await db.collection('devices').doc(order.worker.uid).get();
        if (!deviceDoc.exists) return;

        const devcies = deviceDoc.data().devices;
        if (!devcies || devcies.length===0) return;

        notify['clientID'] = order.worker.uid;
        await admin.messaging.sendToDevice(devcies, {
            notification: {
                title: notify.title,
                body: notify.content
            },
            data: notify
        })

        await db.collection('notifications').add(notify);
    }
}

module.exports = { orderStatus }