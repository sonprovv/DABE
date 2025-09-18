const { db } = require("../config/firebase");
const { failResponse, successResponse } = require("../utils/response");

const postFcmToken = async (req, res) => {
    try {
        const clientID = req.user.uid;
        const { fcmToken } = req.body;

        const deviceDoc = await db.collection('devices').doc(clientID).get();
        if (deviceDoc.exists) {
            const devices = deviceDoc.data().devices;

            if (!devices.includes(fcmToken)) {
                devices.push(fcmToken);

                await db.collection('devices').doc(clientID).update({
                    devices: devices
                })
            }
            else {
                return failResponse(res, 500, 'FcmToken đã tồn tại')
            }
        }
        else {
            await db.collection('devices').doc(clientID).set({
                devices: [fcmToken]
            })
        }

        return successResponse(res, 200, 'Thành công')
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, 'Lỗi FCM Token');
    }
}

const deleteFcmToken = async (req, res) => {
    try {
        const clientID = req.user.uid;
        const { fcmToken } = req.body;

        const deviceDoc = await db.collection('devices').doc(clientID).get();
        if (deviceDoc.exists) {
            const { devices = [] } = deviceDoc.data();

            const result = devices.filter(token => token!==fcmToken);

            await db.collection('devices').doc(clientID).update({
                devices: result
            })
        }
        
        return successResponse(res, 200, 'Thành công')
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, 'Lỗi FCM Token');
    }
}

module.exports = { postFcmToken, deleteFcmToken };