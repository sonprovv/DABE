const AccountService = require("../services/AccountService");
const { findDevices } = require("./tool");

const checkPaymentNotification = async (clientID, jobID, serviceType, amount) => {
    const account = await AccountService.getByUID(clientID);
    const role = account.role;

    const notify = {
        amount: amount,
        jobID: jobID,
        title: 'Thông báo thanh toán',
        content: '',
        isRead: false,
        serviceType: serviceType,
        createdAt: new Date(),
        notificationType: 'Payment'
    }

    if (role==='worker') {
        notify['content'] = `Công việc ${jobID} đã được thanh toán với số tiền ${amount}.\nVui lòng kiểm tra tanh toán...`;
    }
    else if (role==='user') {
        notify['content'] = 'Bạn đã thanh toán thành công.\nCông việc đã được đăng tải.';
    }

    await findDevices(clientID, notify);
}

module.exports = { checkPaymentNotification }