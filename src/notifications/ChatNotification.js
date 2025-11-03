const { db, realtimeDb } = require("../config/firebase");
const { findDevices } = require("./tool");

/**
 * Gửi thông báo khi có tin nhắn mới
 * @param {string} senderId - ID người gửi
 * @param {string} receiverId - ID người nhận
 * @param {string} message - Nội dung tin nhắn
 */
const sendChatNotification = async (senderId, receiverId, message) => {
    console.log('=== BẮT ĐẦU GỬI THÔNG BÁO TIN NHẮN ===');
    console.log(`Người gửi: ${senderId}`);
    console.log(`Người nhận: ${receiverId}`);
    console.log(`Nội dung: ${message}`);
    
    try {
        // Lấy thông tin người gửi từ collection users
        console.log('\n1. Đang tìm thông tin người gửi...');
        let senderDoc = await db.collection('users').doc(senderId).get();
        let senderData = null;
        let userType = 'user';
        
        // Nếu không tìm thấy trong users, thử tìm trong workers
        if (!senderDoc.exists) {
            console.log('   Không tìm thấy trong users, đang tìm trong workers...');
            senderDoc = await db.collection('workers').doc(senderId).get();
            if (!senderDoc.exists) {
                console.error('❌ Lỗi: Không tìm thấy thông tin người gửi trong cả 2 collection');
                return;
            }
            userType = 'worker';
            senderData = senderDoc.data();
        } else {
            senderData = senderDoc.data();
        }

        console.log(`   Đã tìm thấy người gửi trong collection ${userType}`);
        const senderName = senderData.username || senderData.name || senderData.email || 'Người dùng';
        const senderAvatar = senderData.avatar || senderData.photoURL || '';
        const timestamp = Date.now();
        const chatId = [senderId, receiverId].sort().join('_');
        
        console.log('\n2. Thông tin người gửi:');
        console.log(`   - Tên: ${senderName}`);
        console.log(`   - Avatar: ${senderAvatar ? 'Có' : 'Không có'}`);
        console.log(`   - Chat ID: ${chatId}`);

        // Tạo thông báo
        const messageData = {
            message: message,
            senderId: senderId,
            senderName: senderName,
            senderAvatar: senderAvatar,
            timestamp: timestamp,
            isRead: false
        };

        // Lưu tin nhắn vào Realtime Database
        console.log('\n3. Đang lưu tin nhắn vào Realtime Database...');
        const messageRef = realtimeDb.ref(`chats/${chatId}/messages`).push();
        await messageRef.set(messageData);
        console.log('   ✅ Đã lưu tin nhắn vào Realtime Database');

        // Cập nhật thông tin cuộc hội thoại
        console.log('\n4. Đang cập nhật thông tin cuộc hội thoại...');
        const conversationUpdate = {
            lastMessage: message,
            lastMessageTime: timestamp,
            lastMessageSender: senderId,
            [`participants/${senderId}`]: true,
            [`participants/${receiverId}`]: true,
            [`userNames/${senderId}`]: senderName,
            [`userAvatars/${senderId}`]: senderAvatar
        };
        
        await realtimeDb.ref(`conversations/${chatId}`).update(conversationUpdate);
        console.log('   ✅ Đã cập nhật thông tin cuộc hội thoại');

        // Gửi thông báo push
        console.log('\n5. Chuẩn bị gửi thông báo push...');
        const createChatNotification = (senderId, receiverId, message, timestamp) => {
            return {
                title: `${senderName}`,
                content: message,
                senderId: senderId,
                receiverId: receiverId,
                chatId: chatId,
                timestamp: timestamp,
                isRead: false,
                createdAt: new Date().toISOString(),
                notificationType: 'chat',
                data: {
                    type: 'chat',
                    senderId: senderId,
                    chatId: chatId,
                    message: message,
                    timestamp: timestamp,
                    isRead: false
                }
            };
        };
        
        const notify = createChatNotification(senderId, receiverId, message, timestamp);

        console.log('   Thông tin thông báo:', JSON.stringify(notify, null, 2));
        console.log(`\n6. Đang gửi thông báo đến thiết bị của người nhận (${receiverId})...`);
        await findDevices(receiverId, notify);
        console.log('   ✅ Đã gửi yêu cầu thông báo');
        console.log('\n=== KẾT THÚC GỬI THÔNG BÁO TIN NHẮN ===\n');

    } catch (error) {
        console.error('❌ Lỗi khi gửi thông báo chat:', error);
        console.error('Chi tiết lỗi:', error.stack);
        console.log('\n=== LỖI KHI GỬI THÔNG BÁO TIN NHẮN ===\n');
    }
};

module.exports = { sendChatNotification };
