const { db } = require('../config/firebase');
const ChatService = require('../services/ChatService');
const { successResponse, successDataResponse, failResponse } = require('../utils/response');

class ChatController {
    /**
     * Gửi tin nhắn
     * POST /api/chat/send
     */
    static async sendMessage(req, res) {
        console.log('\n=== BẮT ĐẦU XỬ LÝ API GỬI TIN NHẮN ===');
        console.log('Thời gian:', new Date().toISOString());
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        try {
            const senderId = req.client.uid; // Lấy từ token
            console.log('Sender ID từ token:', senderId);
            
            const { receiverId, message, type } = req.body;
            console.log('Dữ liệu nhận được:', { receiverId, message, type });

            if (!receiverId || !message) {
                const errorMsg = 'receiverId and message are required';
                console.error('❌ Lỗi:', errorMsg);
                return failResponse(res, 400, errorMsg);
            }

            // const hasAcceptedOrder = await ChatService.checkAcceptedOrder(senderId, receiverId);
            // if (!hasAcceptedOrder) {
            //     return failResponse(res, 403, 'Bạn chỉ có thể chat với worker/user khi có order được chấp nhận');
            // }

            console.log('\n1. Bắt đầu gửi tin nhắn qua ChatService...');
            const messageData = await ChatService.sendMessage(
                senderId,
                receiverId,
                message,
                type || 'text'
            );
            
            console.log('2. Kết quả từ ChatService:', JSON.stringify(messageData, null, 2));
            
            // Rename messageId to id in the response
            const { messageId, ...rest } = messageData;
            const responseData = { ...rest, id: messageId };
            
            console.log('\n=== KẾT THÚC XỬ LÝ API GỬI TIN NHẮN ===\n');
            
            return successDataResponse(res, 200, responseData, 'message');
        } catch (err) {
            console.error('❌ Lỗi khi xử lý API gửi tin nhắn:', err);
            console.error('Stack trace:', err.stack);
            console.log('\n=== LỖI KHI XỬ LÝ API GỬI TIN NHẮN ===\n');
            return failResponse(res, 500, 'Gửi tin nhắn thất bại: ' + err.message);
        }
    }

    /**
     * Gửi tin nhắn (TEST - không kiểm tra order)
     * POST /api/chat/send-test
     * ⚠️ CHỈ DÙNG CHO DEVELOPMENT/TESTING
     */
    static async sendMessageTest(req, res) {
        try {
            const senderId = req.client.uid;
            const { receiverId, message, type } = req.body;

            if (!receiverId || !message) {
                return failResponse(res, 400, 'receiverId and message are required');
            }

            const messageData = await ChatService.sendMessage(
                senderId,
                receiverId,
                message,
                type || 'text'
            );

            return successDataResponse(res, 201, messageData, 'message');
        } catch (error) {
            console.error('Error in sendMessageTest:', error);
            return failResponse(res, 500, error.message);
        }
    }

    /**
     * Lấy danh sách tin nhắn với một user
     * GET /api/chat/messages/:userId
     */
    static async getMessages(req, res) {
        try {
            const currentUserId = req.client.uid;
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 50;

            if (!userId) {
                return failResponse(res, 400, 'userId is required');
            }

            let messages = await ChatService.getMessages(currentUserId, userId, limit);
            
            // Remove messageId from each message
            messages = messages.map(({ messageId, ...rest }) => rest);

            return successDataResponse(res, 200, messages, 'messages');
        } catch (error) {
            console.error('Error in getMessages:', error);
            return failResponse(res, 500, error.message);
        }
    }

    /**
     * Lấy danh sách conversations
     * GET /api/chat/conversations
     */
    static async getConversations(req, res) {
        try {
            const userId = req.client.uid;
            let conversations = await ChatService.getUserConversations(userId);

            // Transform the conversations to include sender information
            const transformedConversations = await Promise.all(conversations.map(async (conv) => {
                const senderId = conv.otherUserId; // Get the other user's ID
                
                // Get user info from both users and workers collections
                let userDoc = await db.collection('users').doc(senderId).get();
                let userData = userDoc.data();
                let userType = 'user';
                
                if (!userData) {
                    // If not found in users, try workers collection
                    userDoc = await db.collection('workers').doc(senderId).get();
                    userData = userDoc.data();
                    userType = 'worker';
                }

                // Get email from accounts collection
                let email = '';
                try {
                    const accountDoc = await db.collection('accounts').doc(senderId).get();
                    if (accountDoc.exists) {
                        email = accountDoc.data().email || '';
                    }
                } catch (error) {
                    console.error('Error fetching email from accounts:', error);
                }

                // Format date of birth from timestamp to dd/mm/yyyy
                let formattedDob = null;
                if (userData?.dob) {
                    const date = userData.dob.toDate(); // Convert Firestore timestamp to Date
                    formattedDob = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                }

                return {
                    ...conv,
                    senderId: senderId,
                    sender: userData ? {
                        id: senderId,
                        username: userData.username || '',
                        name: userData.name || 'Người dùng',
                        avatar: userData.photoURL || userData.avatar || '',
                        dob: formattedDob,
                        gender: userData.gender || null,
                        location: userData.location || null,
                        tel: userData.tel || userData.phoneNumber || '',
                        email: email,
                        userType: userType
                    } : {
                        id: senderId,
                        name: 'Người dùng',
                        username: '',
                        avatar: '',
                        dob: null,
                        gender: null,
                        location: null,
                        tel: '',
                        email: '',
                        userType: 'unknown'
                    }
                };
            }));

            // Remove undefined fields from the objects and rename conversationId to id
            const cleanConversations = transformedConversations.map(({ conversationId, otherUserId, ...rest }) => ({
                ...rest,
                id: conversationId
            }));

            return successDataResponse(res, 200, cleanConversations, 'conversations');
        } catch (error) {
            console.error('Error in getConversations:', error);
            return failResponse(res, 500, error.message);
        }
    }

    /**
     * Lấy danh sách users có thể chat (có order được chấp nhận)
     * GET /api/chat/available-users
     */
    static async getAvailableChatUsers(req, res) {
        try {
            const userId = req.client.uid;

            const availableUsers = await ChatService.getAvailableChatUsers(userId);

            return successDataResponse(res, 200, availableUsers, 'availableUsers');
        } catch (error) {
            console.error('Error in getAvailableChatUsers:', error);
            return failResponse(res, 500, error.message);
        }
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     * PUT /api/chat/read/:userId
     */
    static async markAsRead(req, res) {
        try {
            const currentUserId = req.client.uid;
            const { userId } = req.params;

            if (!userId) {
                return failResponse(res, 400, 'userId is required');
            }

            await ChatService.markAsRead(currentUserId, userId);

            return successResponse(res, 200, 'Messages marked as read');
        } catch (error) {
            console.error('Error in markAsRead:', error);
            return failResponse(res, 500, error.message);
        }
    }

    /**
     * Xóa tin nhắn
     * DELETE /api/chat/message/:conversationId/:messageId
     */
    static async deleteMessage(req, res) {
        try {
            const userId = req.client.uid;
            const { conversationId, messageId } = req.params;

            if (!conversationId || !messageId) {
                return failResponse(res, 400, 'conversationId and messageId are required');
            }

            await ChatService.deleteMessage(userId, conversationId, messageId);

            return successResponse(res, 200, 'Message deleted successfully');
        } catch (error) {
            console.error('Error in deleteMessage:', error);
            return failResponse(res, 500, error.message);
        }
    }

    /**
     * Xóa conversation
     * DELETE /api/chat/conversation/:userId
     */
    static async deleteConversation(req, res) {
        try {
            const currentUserId = req.client.uid;
            const { userId } = req.params;

            if (!userId) {
                return failResponse(res, 400, 'userId is required');
            }

            await ChatService.deleteConversation(currentUserId, userId);

            return successResponse(res, 200, 'Conversation deleted successfully');
        } catch (error) {
            console.error('Error in deleteConversation:', error);
            return failResponse(res, 500, error.message);
        }
    }

    /**
     * Kiểm tra trạng thái online của user
     * GET /api/chat/status/:userId
     */
    static async getUserStatus(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return failResponse(res, 400, 'userId is required');
            }

            const isOnline = await ChatService.isUserOnline(userId);

            return successDataResponse(res, 200, { userId, isOnline }, 'status');
        } catch (error) {
            console.error('Error in getUserStatus:', error);
            return failResponse(res, 500, error.message);
        }
    }

    /**
     * Cập nhật trạng thái online
     * POST /api/chat/status
     */
    static async updateStatus(req, res) {
        try {
            const userId = req.client.uid;
            const { state } = req.body;

            if (!state || !['online', 'offline'].includes(state)) {
                return failResponse(res, 400, 'Valid state (online/offline) is required');
            }

            await ChatService.updateUserStatus(userId, state);

            return successDataResponse(res, 200, { userId, state }, 'status');
        } catch (error) {
            console.error('Error in updateStatus:', error);
            return failResponse(res, 500, error.message);
        }
    }
}

module.exports = ChatController;
