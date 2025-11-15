const { db, realtimeDb, messaging, FieldValue } = require("./firebase.js");

console.log("🚀 Chat listener started...");

const conversationsRef = realtimeDb.ref("conversations");
const activeListeners = new Map();

// Hàm gửi thông báo
const sendNotification = async (roomId, mes) => {
    try {
    const senderId = mes.senderId;
    const receiverId = mes.receiverId;
    const content = mes.message;
    const {  type = 'text' } = mes;
    
    if (!senderId || !receiverId) {
      console.error("❌ Missing senderId or receiverId in message");
      return;
    }

    console.log(`💬 New ${type} message from ${senderId} → ${receiverId}`);

    // Lấy thông tin người gửi từ users, nếu không có thì fallback sang workers
    let senderName = 'Ai đó';
    try {
      const senderSnap = await db.collection('users').doc(senderId).get();
      const senderData = senderSnap.exists ? senderSnap.data() : null;
      if (senderData) {
        senderName = senderData.username || senderData.displayName || senderData.name || senderName;
      } else {
        const workerSnap = await db.collection('workers').doc(senderId).get();
        const workerData = workerSnap.exists ? workerSnap.data() : null;
        if (workerData) {
          senderName = workerData.username || workerData.displayName || workerData.name || senderName;
        }
        }
    } catch (e) {
      console.error('⚠️ Error fetching sender profile:', e.message);
    }

    // Lấy FCM token của người nhận
    const tokenSnap = await db.collection(`devices`).doc(receiverId).get();
    const tokens = tokenSnap.data();

    if (!tokens) {
      console.log(`⚠️ User ${receiverId} has no FCM token`);
            return;
        }

    // Tạo nội dung thông báo với fallback an toàn
    const fallbackBody = 'Bạn có tin nhắn mới';
    let notificationBody = '';
        switch (type) {
            case 'image':
                notificationBody = '📷 Đã gửi một hình ảnh';
                break;
            case 'file':
                notificationBody = '📄 Đã gửi một tệp tin';
                break;
      default: {
        const text = typeof content === 'string' ? content.trim() : '';
        if (text.length > 0) {
          notificationBody = text.length > 50 ? `${text.substring(0, 50)}...` : text;
        } else {
          notificationBody = fallbackBody;
                }
        break;
      }
    }

    // Lấy thông tin đầy đủ của người gửi
    let senderAvatar = '';
    try {
      // Thử lấy từ users collection trước
      const userDoc = await db.collection('users').doc(senderId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        senderAvatar = userData.avatar || userData.photoURL || '';
      } else {
        // Nếu không tìm thấy trong users, thử tìm trong workers
        const workerDoc = await db.collection('workers').doc(senderId).get();
        if (workerDoc.exists) {
          const workerData = workerDoc.data();
          senderAvatar = workerData.avatar || workerData.photoURL || '';
        }
      }
    } catch (error) {
      console.error('Error fetching sender data:', error);
    }
    
    // Thêm tham số transform vào URL ảnh nếu là Cloudinary
    if (senderAvatar && senderAvatar.includes('cloudinary.com')) {
      // Kiểm tra xem URL đã có transform chưa
      if (!senderAvatar.includes('/w_') || !senderAvatar.includes('/c_')) {
        // Tìm vị trí của '/upload/'
        const uploadIndex = senderAvatar.indexOf('/upload/') + '/upload/'.length;
        // Thêm transform vào URL
        senderAvatar = `${senderAvatar.substring(0, uploadIndex)}w_400,h_400,c_fill/${senderAvatar.substring(uploadIndex)}`;
        console.log(`🖼️ Optimized image URL: ${senderAvatar}`);
      }
    }
    
    console.log(`👤 Sender avatar URL: ${senderAvatar || 'Not available'}`);
    
    // Tạo payload gửi FCM
    const payload = {
      notification: {
        title: `${senderName}`,
                body: notificationBody,
        // Thêm hình ảnh vào notification (chỉ hoạt động trên một số nền tảng)
        image: senderAvatar || undefined,
      },
      data: {
        // Thông tin cơ bản
        type: 'new_message',
        roomId: roomId,
        senderId: senderId,
        senderName: senderName, // Thêm tên người gửi vào data
        senderAvatar: senderAvatar, // Thêm avatar vào data
        messageType: type,
        ...(content && { content }),
        timestamp: Date.now().toString(),
        
        // Thông tin điều hướng
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        route: '/chat',
        chat_room_id: roomId,
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
                headers: {
                    'apns-priority': '10',
                },
            },
      
      // Thêm thời gian gửi để debug
      fcmOptions: {
        analyticsLabel: `chat_${Date.now()}`
      }
    };
    
    // Log toàn bộ payload để debug
    console.log('📤 FCM Payload to be sent:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('📤 End of FCM Payload');
    

    // Gửi FCM đến tất cả các thiết bị của người nhận
    const tokenList = Array.isArray(tokens.devices) ? tokens.devices : [];
    if (tokenList.length === 0) {
      console.log(`⚠️ User ${receiverId} has empty devices list`);
      return;
    }

    const message = {
      tokens: tokenList,
      notification: payload.notification,
      data: payload.data,
      android: payload.android,
      apns: payload.apns,
    };

    // Log nội dung thông báo trước khi gửi
    // console.log('📦 FCM payload:', {
    //   to: receiverId,
    //   tokens: tokenList,
    //   notification: payload.notification,
    //   data: payload.data,
    // });

    const resp = await messaging.sendEachForMulticast(message);
    console.log(`📨 FCM multicast: success=${resp.successCount} failure=${resp.failureCount}`);

    // Log chi tiết từng token
    const successTokens = [];
    const failedTokens = [];
    resp.responses.forEach((r, idx) => {
      const t = tokenList[idx];
      if (r.success) {
        // console.log(`✅ Token OK: ${t}`);
        successTokens.push(t);
      } else {
        const code = r.error?.code || 'unknown';
        const msg = r.error?.message || 'no message';
        console.error(`❌ Token FAIL: ${t} | code=${code} | message=${msg}`);
        failedTokens.push({ token: t, code, msg });
      }
    });

    if (successTokens.length > 0) {
      console.log(`🎉 Sent notification successfully to ${successTokens.length} device(s) for user ${receiverId}`);
    }

    // Xử lý các token thất bại -> loại khỏi Firestore
    if (resp.failureCount > 0) {
      const invalidTokens = resp.responses
        .map((r, idx) => ({ r, token: tokenList[idx] }))
        .filter(x => !x.r.success && x.r.error && (
          x.r.error.code === 'messaging/registration-token-not-registered' ||
          x.r.error.code === 'messaging/invalid-registration-token' ||
          x.r.error.code === 'messaging/sender-id-mismatch' ||
          x.r.error.code === 'messaging/mismatched-credential'
        ))
        .map(x => x.token);

            if (invalidTokens.length > 0) {
                await db.collection('devices').doc(receiverId).update({
                    devices: FieldValue.arrayRemove(...invalidTokens)
                });
        console.log(`🗑️ Removed ${invalidTokens.length} invalid tokens from Firestore`);
            }
        }
    } catch (error) {
    console.error('❌ Error in sendNotification:', error);
    }
};

// Xử lý khi có conversation mới
const setupConversationListener = () => {
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
    const messagesRef = realtimeDb.ref(`conversations/${roomId}`);
                
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
const cleanupListeners = () => {
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

module.exports = { setupConversationListener, cleanupListeners };

// Xử lý tắt ứng dụng
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
    cleanupListeners();
    process.exit(0);
});

// Khởi động listener (để tránh duplicate, chỉ nên gọi trong index.js)
// setupConversationListener();