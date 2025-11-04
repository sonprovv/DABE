import { db, fcm, realtimeDb } from "./firebase.js";

console.log("🚀 Chat listener started...");

const conversationsRef = realtimeDb.ref("conversations");
const activeListeners = new Map();

// Hàm gửi thông báo
const sendNotification = async (roomId, message) => {
  try {
    const { senderId, receiverId, content, type = 'text' } = message;
    
    if (!senderId || !receiverId) {
      console.error("❌ Missing senderId or receiverId in message");
      return;
    }

    console.log(`💬 New ${type} message from ${senderId} → ${receiverId}`);

    // Lấy thông tin người gửi
    const senderSnap = await db.collection(`users`).doc(senderId).get();
    const senderData = senderSnap.data();
    const senderName = senderData?.displayName || 'Ai đó';

    // Lấy FCM token của người nhận
    const tokenSnap = await db.collection(`devices`).doc(receiverId).get();
    const tokens = tokenSnap.data();

    if (!tokens) {
      console.log(`⚠️ User ${receiverId} has no FCM token`);
      return;
    }

    // Tạo nội dung thông báo
    let notificationBody = '';
    switch(type) {
      case 'image':
        notificationBody = '📷 Đã gửi một hình ảnh';
        break;
      case 'file':
        notificationBody = '📄 Đã gửi một tệp tin';
        break;
      default:
        notificationBody = content?.length > 50 ? `${content.substring(0, 50)}...` : content;
    }

    // Tạo payload gửi FCM
    const payload = {
      notification: {
        title: `${senderName}`,
        body: notificationBody,
        sound: 'default',
        badge: '1',
      },
      data: {
        type: 'new_message',
        roomId,
        senderId,
        messageType: type,
        ...(content && { content }),
        timestamp: Date.now().toString(),
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    // Gửi FCM đến tất cả các thiết bị của người nhận
    const tokenEntries = Object.entries(tokens);
    const sendPromises = tokenEntries.map(async ([tokenId, tokenData]) => {
      try {
        await fcm.sendToDevice(tokenData.token, payload);
        console.log(`📩 Sent push to ${receiverId} (${tokenId})`);
      } catch (error) {
        console.error(`❌ Error sending to token ${tokenId}:`, error.message);
        // Xóa token không hợp lệ
        if (error.code === 'messaging/registration-token-not-registered') {
          await db.ref(`devices/${receiverId}/${tokenId}`).remove();
          console.log(`🗑️ Removed invalid token: ${tokenId}`);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error('❌ Error in sendNotification:', error);
  }
};

// Xử lý khi có conversation mới
export const setupConversationListener = () => {
  console.log('🔊 Setting up conversation listeners...');
  
  // Lắng nghe khi có conversation mới
  conversationsRef.on("child_added", (roomSnap) => {
    const roomId = roomSnap.key;
    
    // Nếu đã có listener cho room này rồi thì bỏ qua
    if (activeListeners.has(roomId)) {
      return;
    }

    console.log(`👂 Listening to room: ${roomId}`);
    
    // Tạo reference đến messages của room
    const messagesRef = db.ref(`conversations/${roomId}/messages`);
    
    // Hàm xử lý tin nhắn mới
    const handleNewMessage = (msgSnap) => {
      const message = msgSnap.val();
      if (!message) return;
      
      // Gửi thông báo
      sendNotification(roomId, message);
    };
    
    // Lắng nghe tin nhắn mới
    messagesRef.on("child_added", handleNewMessage);
    
    // Lưu lại reference để có thể hủy listener sau này
    activeListeners.set(roomId, {
      ref: messagesRef,
      handler: handleNewMessage
    });
  });
};

// Hàm dọn dẹp listeners
export const cleanupListeners = () => {
  console.log('🧹 Cleaning up listeners...');
  
  // Hủy tất cả listeners
  activeListeners.forEach(({ ref, handler }, roomId) => {
    ref.off("child_added", handler);
    console.log(`🔇 Stopped listening to room: ${roomId}`);
  });
  
  // Xóa tất cả listeners khỏi Map
  activeListeners.clear();
  
  // Hủy listener của conversations
  conversationsRef.off("child_added");
};

// Xử lý tắt ứng dụng
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  cleanupListeners();
  process.exit(0);
});

// Khởi động listener
setupConversationListener();