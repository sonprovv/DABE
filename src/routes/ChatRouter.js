const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const { verifyToken } = require('../middleware/verifyToken');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: API quản lý chat 1-1
 */

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Gửi tin nhắn
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - message
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID của người nhận
 *               message:
 *                 type: string
 *                 description: Nội dung tin nhắn
 *               type:
 *                 type: string
 *                 enum: [text, image, file]
 *                 default: text
 *                 description: Loại tin nhắn
 *     responses:
 *       201:
 *         description: Gửi tin nhắn thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       401:
 *         description: Chưa xác thực
 */
router.post('/send', verifyToken, ChatController.sendMessage);

/**
 * @swagger
 * /api/chat/send-test:
 *   post:
 *     summary: Gửi tin nhắn (TEST - không kiểm tra order)
 *     description: ⚠️ CHỈ DÙNG CHO DEVELOPMENT/TESTING - Bỏ qua kiểm tra order được chấp nhận
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - message
 *             properties:
 *               receiverId:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, image, file]
 *                 default: text
 *     responses:
 *       201:
 *         description: Gửi tin nhắn thành công
 */
router.post('/send-test', verifyToken, ChatController.sendMessageTest);

/**
 * @swagger
 * /api/chat/messages/{userId}:
 *   get:
 *     summary: Lấy danh sách tin nhắn với một user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user cần lấy tin nhắn
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Số lượng tin nhắn tối đa
 *     responses:
 *       200:
 *         description: Lấy tin nhắn thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/messages/:userId', verifyToken, ChatController.getMessages);

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: Lấy danh sách conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách conversations thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/conversations', verifyToken, ChatController.getConversations);

/**
 * @swagger
 * /api/chat/available-users:
 *   get:
 *     summary: Lấy danh sách users có thể chat (có order đư���c chấp nhận)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách users thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/available-users', verifyToken, ChatController.getAvailableChatUsers);

/**
 * @swagger
 * /api/chat/read/{userId}:
 *   put:
 *     summary: Đánh dấu tin nhắn đã đọc
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Đánh dấu đã đọc thành công
 *       401:
 *         description: Chưa xác thực
 */
router.put('/read/:userId', verifyToken, ChatController.markAsRead);

/**
 * @swagger
 * /api/chat/message/{conversationId}/{messageId}:
 *   delete:
 *     summary: Xóa tin nhắn
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa tin nhắn thành công
 *       401:
 *         description: Chưa xác thực
 */
router.delete('/message/:conversationId/:messageId', verifyToken, ChatController.deleteMessage);

/**
 * @swagger
 * /api/chat/conversation/{userId}:
 *   delete:
 *     summary: Xóa conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Xóa conversation thành công
 *       401:
 *         description: Chưa xác thực
 */
router.delete('/conversation/:userId', verifyToken, ChatController.deleteConversation);

/**
 * @swagger
 * /api/chat/status/{userId}:
 *   get:
 *     summary: Kiểm tra trạng thái online của user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy trạng thái thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/status/:userId', verifyToken, ChatController.getUserStatus);

/**
 * @swagger
 * /api/chat/status:
 *   post:
 *     summary: Cập nhật trạng thái online/offline
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - state
 *             properties:
 *               state:
 *                 type: string
 *                 enum: [online, offline]
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       401:
 *         description: Chưa xác thực
 */
router.post('/status', verifyToken, ChatController.updateStatus);

module.exports = router;
