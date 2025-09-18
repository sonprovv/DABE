const { formatDateAndTime } = require("../utils/formatDate");

class NotificationModel {

    constructor(data) {
        this.uid = data.uid;
        this.jobID = data.jobID;
        this.title = data.title;
        this.content = data.content;
        this.isRead = data.isRead;
        this.time = data.time;
        this.serviceType = data.serviceType;
        this.createdAt = data.createdAt;
    }

    getInfo() {
        return {
            uid: this.uid,
            jobID: this.jobID,
            title: this.title,
            content: this.content,
            isRead: this.isRead,
            time: this.time,
            serviceType: this.serviceType,
            createdAt: formatDateAndTime(typeof this.createdAt.toDate=='function' ? this.createdAt.toDate() : this.createdAt)
        }
    }
}

module.exports = NotificationModel;