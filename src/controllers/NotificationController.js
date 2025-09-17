const { admin } = require("../config/firebase");
const NotificationService = require("../services/NotificationService");
const { failResponse, successDataResponse } = require("../utils/response");

const getByClientID = async (req, res) => {
    try {
        const clientID = req.user.uid;

        const notifications = await NotificationService.getByClientID(clientID);

        return successDataResponse(res, 200, notifications, 'notifications');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const putClientReaded = async (req, res) => {
    try {
        const clientID = req.user.uid;
        const { notificationID } = req.params;

        const notification = await NotificationService.putClientReaded(clientID, notificationID);

        return successDataResponse(res, 200, notification, 'notification');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

module.exports = {
    getByClientID,
    putClientReaded
}