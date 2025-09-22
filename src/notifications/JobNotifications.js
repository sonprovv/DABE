const { db } = require("../config/firebase");

let cleaningJobInterval = null, healthcareJobInterval = null;

const format30M = () => {
    const now = new Date();
    return new Date(now.getTime() + 30 * 60000);
};

const findWorkerAndNotify = async (userSockets, job, notify) => {
    const snapshotOrder = await db.collection("orders").where('jobID', '==', job.id).get();
    snapshotOrder.forEach(async doc => {
        const socket = userSockets.get(doc.data().workerID);

        console.log(doc.data().workerID);

        if (socket) {
            socket.emit('jobNotification', notify);
            await db.collection('notifications').add({
                ...notify,
                workerID: doc.data().workerID,
                createdAt: new Date()
            })
        }
    })
}

const cleaningJobSchedule = (io, userSockets) => {

    if (cleaningJobInterval) return;

    cleaningJobInterval = setInterval(async () => {
        const alert30 = format30M();

        const notify30Start = new Date(alert30.getTime() - 60 * 1000);
        const notify30End = new Date(alert30.getTime() + 60 * 1000);

        const alert = new Date();

        const notifyNowStart = new Date(alert.getTime() - 60 * 1000);
        const notifyNowEnd = new Date(alert.getTime() + 60 * 1000);

        const snapshot = await db.collection("cleaningJobs").get();

        for (const job of snapshot.docs) {
            const startJob = job.data().startTime.toDate();
            const endJob = job.data().endTime.toDate();

            const notify = {
                jobID: job.id,
                title: 'Thông báo công việc',
                content: '',
                time: null,
                serviceType: 'CLEANING'
            }

            if (startJob >= notify30Start && startJob <= notify30End) {
                notify['content'] = 'Công việc sẽ bắt đầu sau 30 phút.\n Vui lòng sắp xếp di chuyển để thực hiện công việc.';
                notify['time'] = startJob;
                await findWorkerAndNotify(userSockets, job, notify);
            }
            else if (startJob >= notifyNowStart && startJob <= notifyNowEnd) {
                notify['content'] = 'Công việc đã bắt đầu.';
                notify['time'] = startJob;
                await findWorkerAndNotify(userSockets, job, notify);
            }
            else if (endJob >= notifyNowStart && endJob <= notifyNowEnd) {
                notify['content'] = 'Công việc đã kết thúc.';
                notify['time'] = endJob;
                await findWorkerAndNotify(userSockets, job, notify);
            }
        }
    }, 60000);
};

const healthcareJobSchedule = (io, userSockets) => {

    if (healthcareJobInterval) return;

    healthcareJobInterval = setInterval(async () => {
        const alert30 = format30M();

        const notify30Start = new Date(alert30.getTime() - 60 * 1000);
        const notify30End = new Date(alert30.getTime() + 60 * 1000);

        const alert = new Date();

        const notifyNowStart = new Date(alert.getTime() - 60 * 1000);
        const notifyNowEnd = new Date(alert.getTime() + 60 * 1000);

        const snapshot = await db.collection("cleaningJobs").get();

        for (const job of snapshot.docs) {
            const startJob = job.data().startTime.toDate();
            const endJob = job.data().endTime.toDate();

            const notify = {
                jobID: job.id,
                title: 'Thông báo công việc',
                content: '',
                time: null,
                serviceType: 'HEALTHCARE'
            }

            if (startJob >= notify30Start && startJob <= notify30End) {
                notify['content'] = 'Công việc sẽ bắt đầu sau 30 phút.\n Vui lòng sắp xếp di chuyển để thực hiện công việc.';
                notify['time'] = startJob;
                await findWorkerAndNotify(userSockets, job, notify);
            }
            else if (startJob >= notifyNowStart && startJob <= notifyNowEnd) {
                notify['content'] = 'Công việc đã bắt đầu.';
                notify['time'] = startJob;
                await findWorkerAndNotify(userSockets, job, notify);
            }
            else if (endJob >= notifyNowStart && endJob <= notifyNowEnd) {
                notify['content'] = 'Công việc đã kết thúc.';
                notify['time'] = endJob;
                await findWorkerAndNotify(userSockets, job, notify);
            }
        }
    }, 60000);
};

module.exports = { cleaningJobSchedule, healthcareJobSchedule };