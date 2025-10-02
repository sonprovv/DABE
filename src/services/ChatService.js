const { realtimeDb, db, admin } = require('../config/firebase');

class ChatService {
    /**
     * Kiểm tra xem 2 users có order được chấp nhận không
     * @param {string} userId1 - ID của user thứ nhất
     * @param {string} userId2 - ID của user thứ hai
     * @returns {Promise<boolean>}
     */
    static async checkAcceptedOrder(userId1, userId2) {
        try {
            // Kiểm tra order với userId1 là worker và userId2 là user (qua jobID)
            const ordersSnapshot1 = await db.collection('orders')
                .where('workerID', '==', userId1)
                .where('status', '==', 'Accepted')
                .get();

            for (const doc of ordersSnapshot1.docs) {
                const jobSnapshot = await db.collection('jobs').doc(doc.data().jobID).get();
                if (jobSnapshot.exists && jobSnapshot.data().userID === userId2) {
                    return true;
                }
            }

            // Kiểm tra ngược lại: userId2 là worker và userId1 là user
            const ordersSnapshot2 = await db.collection('orders')
                .where('workerID', '==', userId2)
                .where('status', '==', 'Accepted')
                .get();

            for (const doc of ordersSnapshot2.docs) {
                const jobSnapshot = await db.collection('jobs').doc(doc.data().jobID).get();
                if (jobSnapshot.exists && jobSnapshot.data().userID === userId1) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Error checking accepted order:', error);
            return false;
        }
    }
    /**
     * Tạo hoặc lấy conversation ID giữa 2 users
     * @param {string} userId1 - ID của user thứ nhất
     * @param {string} userId2 - ID của user thứ hai
     * @returns {string} conversationId
     */
    static getConversationId(userId1, userId2) {
        // Sắp xếp để đảm bảo conversation ID luôn giống nhau cho 2 users
        return [userId1, userId2].sort().join('_');
    }

    /**
     * Gửi tin nhắn
     * @param {string} senderId - ID người gửi
     * @param {string} receiverId - ID người nhận
     * @param {string} message - Nội dung tin nhắn
     * @param {string} type - Loại tin nhắn (text, image, file)
     * @returns {Promise<Object>} Message data
     */
    static async sendMessage(senderId, receiverId, message, type = 'text') {
        try {
            const conversationId = this.getConversationId(senderId, receiverId);
            const messageRef = realtimeDb.ref(`conversations/${conversationId}/messages`).push();
            
            const messageData = {
                messageId: messageRef.key,
                senderId,
                receiverId,
                message,
                type,
                timestamp: Date.now(),
                isRead: false,
                createdAt: new Date().toISOString()
            };

            await messageRef.set(messageData);

            // Cập nhật thông tin conversation
            await realtimeDb.ref(`conversations/${conversationId}/info`).set({
                participants: [senderId, receiverId],
                lastMessage: message,
                lastMessageTime: Date.now(),
                lastMessageSender: senderId,
                updatedAt: new Date().toISOString()
            });

            // Cập nhật danh sách conversations cho mỗi user
            await Promise.all([
                realtimeDb.ref(`userConversations/${senderId}/${conversationId}`).set({
                    otherUserId: receiverId,
                    lastMessage: message,
                    lastMessageTime: Date.now(),
                    unreadCount: 0
                }),
                realtimeDb.ref(`userConversations/${receiverId}/${conversationId}`).update({
                    otherUserId: senderId,
                    lastMessage: message,
                    lastMessageTime: Date.now(),
                    unreadCount: admin.database.ServerValue.increment(1)
                })
            ]);

            return messageData;
        } catch (error) {
            throw new Error(`Error sending message: ${error.message}`);
        }
    }

    /**
     * Lấy danh sách tin nhắn trong conversation
     * @param {string} userId1 - ID của user thứ nhất
     * @param {string} userId2 - ID của user thứ hai
     * @param {number} limit - Số lượng tin nhắn tối đa
     * @returns {Promise<Array>} Danh sách tin nhắn
     */
    static async getMessages(userId1, userId2, limit = 50) {
        try {
            const conversationId = this.getConversationId(userId1, userId2);
            const messagesRef = realtimeDb.ref(`conversations/${conversationId}/messages`);
            
            const snapshot = await messagesRef
                .orderByChild('timestamp')
                .limitToLast(limit)
                .once('value');

            const messages = [];
            snapshot.forEach((childSnapshot) => {
                messages.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            return messages;
        } catch (error) {
            throw new Error(`Error getting messages: ${error.message}`);
        }
    }

    /**
     * Lấy danh sách conversations của user
     * @param {string} userId - ID của user
     * @returns {Promise<Array>} Danh sách conversations
     */
    static async getUserConversations(userId) {
        try {
            const conversationsRef = realtimeDb.ref(`userConversations/${userId}`);
            const snapshot = await conversationsRef
                .orderByChild('lastMessageTime')
                .once('value');

            const conversations = [];
            snapshot.forEach((childSnapshot) => {
                conversations.push({
                    conversationId: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // Sắp xếp theo thời gian mới nhất
            return conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        } catch (error) {
            throw new Error(`Error getting conversations: ${error.message}`);
        }
    }

    /**
     * Lấy danh sách users có thể chat (có order được chấp nhận)
     * @param {string} userId - ID của user hiện tại
     * @returns {Promise<Array>} Danh sách users có thể chat
     */
    static async getAvailableChatUsers(userId) {
        try {
            const availableUsers = new Set();

            // Lấy các orders mà user này là worker và đã được chấp nhận
            const workerOrdersSnapshot = await db.collection('orders')
                .where('workerID', '==', userId)
                .where('status', '==', 'Accepted')
                .get();

            for (const doc of workerOrdersSnapshot.docs) {
                const jobSnapshot = await db.collection('jobs').doc(doc.data().jobID).get();
                if (jobSnapshot.exists) {
                    availableUsers.add(jobSnapshot.data().userID);
                }
            }

            // Lấy các orders mà user này là người đăng job và đã chấp nhận worker
            const userJobsSnapshot = await db.collection('jobs')
                .where('userID', '==', userId)
                .get();

            const jobIds = userJobsSnapshot.docs.map(doc => doc.id);

            if (jobIds.length > 0) {
                // Firestore không hỗ trợ array-contains với where, nên phải query từng job
                for (const jobId of jobIds) {
                    const acceptedOrdersSnapshot = await db.collection('orders')
                        .where('jobID', '==', jobId)
                        .where('status', '==', 'Accepted')
                        .get();

                    acceptedOrdersSnapshot.docs.forEach(doc => {
                        availableUsers.add(doc.data().workerID);
                    });
                }
            }

            return Array.from(availableUsers);
        } catch (error) {
            throw new Error(`Error getting available chat users: ${error.message}`);
        }
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     * @param {string} userId - ID của user đang đọc
     * @param {string} otherUserId - ID của user kia
     * @returns {Promise<void>}
     */
    static async markAsRead(userId, otherUserId) {
        try {
            const conversationId = this.getConversationId(userId, otherUserId);
            
            // Lấy tất cả tin nhắn chưa đọc
            const messagesRef = realtimeDb.ref(`conversations/${conversationId}/messages`);
            const snapshot = await messagesRef
                .orderByChild('receiverId')
                .equalTo(userId)
                .once('value');

            const updates = {};
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                if (!message.isRead) {
                    updates[`conversations/${conversationId}/messages/${childSnapshot.key}/isRead`] = true;
                }
            });

            // Reset unread count
            updates[`userConversations/${userId}/${conversationId}/unreadCount`] = 0;

            await realtimeDb.ref().update(updates);
        } catch (error) {
            throw new Error(`Error marking messages as read: ${error.message}`);
        }
    }

    /**
     * Xóa tin nhắn
     * @param {string} userId - ID của user xóa tin nhắn
     * @param {string} conversationId - ID của conversation
     * @param {string} messageId - ID của tin nhắn
     * @returns {Promise<void>}
     */
    static async deleteMessage(userId, conversationId, messageId) {
        try {
            const messageRef = realtimeDb.ref(`conversations/${conversationId}/messages/${messageId}`);
            const snapshot = await messageRef.once('value');
            const message = snapshot.val();

            if (!message) {
                throw new Error('Message not found');
            }

            // Chỉ người gửi mới có thể xóa tin nhắn
            if (message.senderId !== userId) {
                throw new Error('Unauthorized to delete this message');
            }

            await messageRef.remove();
        } catch (error) {
            throw new Error(`Error deleting message: ${error.message}`);
        }
    }

    /**
     * Xóa toàn bộ conversation
     * @param {string} userId - ID của user
     * @param {string} otherUserId - ID của user kia
     * @returns {Promise<void>}
     */
    static async deleteConversation(userId, otherUserId) {
        try {
            const conversationId = this.getConversationId(userId, otherUserId);
            
            const updates = {};
            updates[`conversations/${conversationId}`] = null;
            updates[`userConversations/${userId}/${conversationId}`] = null;
            updates[`userConversations/${otherUserId}/${conversationId}`] = null;

            await realtimeDb.ref().update(updates);
        } catch (error) {
            throw new Error(`Error deleting conversation: ${error.message}`);
        }
    }

    /**
     * Kiểm tra user có online không
     * @param {string} userId - ID của user
     * @returns {Promise<boolean>}
     */
    static async isUserOnline(userId) {
        try {
            const statusRef = realtimeDb.ref(`status/${userId}`);
            const snapshot = await statusRef.once('value');
            const status = snapshot.val();
            
            return status && status.state === 'online';
        } catch (error) {
            throw new Error(`Error checking user status: ${error.message}`);
        }
    }

    /**
     * Cập nhật trạng thái online/offline
     * @param {string} userId - ID của user
     * @param {string} state - Trạng thái (online/offline)
     * @returns {Promise<void>}
     */
    static async updateUserStatus(userId, state = 'online') {
        try {
            const statusRef = realtimeDb.ref(`status/${userId}`);
            
            await statusRef.set({
                state,
                lastChanged: Date.now(),
                timestamp: new Date().toISOString()
            });

            // Tự động set offline khi disconnect
            if (state === 'online') {
                await statusRef.onDisconnect().set({
                    state: 'offline',
                    lastChanged: Date.now(),
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            throw new Error(`Error updating user status: ${error.message}`);
        }
    }
}

module.exports = ChatService;
