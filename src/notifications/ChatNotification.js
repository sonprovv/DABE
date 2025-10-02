const { db } = require("../config/firebase");
const { findDevices } = require("./tool");

/**
 * Gửi thông báo khi có tin nhắn mới
 * @param {string} senderId - ID người gửi
 * @param {string} receiverId - ID người nhận
 * @param {string} message - Nội dung tin nhắn
 * @param {string} type - Loại tin nhắn (text, image, file)
 */
const sendChatNotification = async (senderId, receiverId, message, type = 'text') => {
    try {
        // Lấy thông tin người gửi
        const senderDoc = await db.collection('users').doc(senderId).get();
        if (!senderDoc.exists) return;

        const senderData = senderDoc.data();
        const senderName = senderData.name || senderData.email || 'Người dùng';
        const senderAvatar = senderData.avatar || senderData.photoURL || '';

        // Tạo nội dung thông báo
        let notificationContent = message;
        if (type === 'image') {
            notificationContent = '📷 Đã gửi một hình ảnh';
        } else if (type === 'file') {
            notificationContent = '📎 Đã gửi một file';
        }

        // Tạo thông báo trong Firestore
        const notify = {
            title: `Tin nhắn mới từ ${senderName}`,
            content: notificationContent,
            isRead: false,
            createdAt: new Date(),
            notificationType: 'Chat',
            senderId: senderId,
            senderName: senderName,
            senderAvatar: senderAvatar,
            messageType: type
        };

        await db.collection('notifications').add({
            ...notify,
            clientID: receiverId
        });

        // Gửi FCM notification
        await findDevices(receiverId, notify);

    } catch (error) {
        console.error('Error sending chat notification:', error);
        // Không throw error để không ảnh hưởng đến việc gửi tin nhắn
    }
};

module.exports = { sendChatNotification };
