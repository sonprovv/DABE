const { db } = require("../config/firebase");
const { failResponse, successResponse } = require("../utils/response");

const postFcmToken = async (req, res) => {
    try {
        const { clientID } = req.params;
        const { fcmToken } = req.body;

        const deviceDoc = await db.collection('devices').doc(clientID).get();
        const devices = deviceDoc.data().devices;

        devices.push(fcmToken);

        await db.collection('devices').doc(clientID).update({
            devices: devices
        })

        return successResponse(res, 200, 'Thành công')
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, 'Lỗi FCM Token');
    }
}

module.exports = { postFcmToken };