const ChatService = require('../services/ChatService');
const { successResponse, successDataResponse, failResponse } = require('../utils/response');

class ChatController {
    /**
     * Gửi tin nhắn
     * POST /api/chat/send
     */
    static async sendMessage(req, res) {
        try {
            const senderId = req.client.uid; // Lấy từ token
            const { receiverId, message, type } = req.body;

            if (!receiverId || !message) {
                return failResponse(res, 400, 'receiverId and message are required');
            }

            // Kiểm tra xem có order được chấp nhận không
            const hasAcceptedOrder = await ChatService.checkAcceptedOrder(senderId, receiverId);
            if (!hasAcceptedOrder) {
                return failResponse(res, 403, 'Bạn chỉ có thể chat với worker/user khi có order được chấp nhận');
            }

            const messageData = await ChatService.sendMessage(
                senderId,
                receiverId,
                message,
                type || 'text'
            );

            return successDataResponse(res, 201, messageData, 'message');
        } catch (error) {
            console.error('Error in sendMessage:', error);
            return failResponse(res, 500, error.message);
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

            const messages = await ChatService.getMessages(currentUserId, userId, limit);

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

            const conversations = await ChatService.getUserConversations(userId);

            return successDataResponse(res, 200, conversations, 'conversations');
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
