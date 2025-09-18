const { db } = require("../config/firebase");
const { failResponse, successResponse } = require("../utils/response");

const postFcmToken = async (req, res) => {
    try {
        const clientID = req.user.uid;
        const { fcmToken } = req.body;

        const deviceDoc = await db.collection('devices').doc(clientID).get();
        if (deviceDoc.exists) {
            const devices = deviceDoc.data().devices;

            devices.push(fcmToken);

            await db.collection('devices').doc(clientID).update({
                devices: devices
            })
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

module.exports = { postFcmToken };