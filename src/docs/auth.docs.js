/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Xác thực người dùng
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GoogleSignInRequest:
 *       type: object
 *       required:
 *         - idToken
 *       properties:
 *         idToken:
 *           type: string
 *           description: ID token từ Google Sign-In
 *       example:
 *         idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAiLCJ0eXAiOiJKV1QifQ..."
 * 
 *     UserProfile:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *           description: ID duy nhất của người dùng
 *         username:
 *           type: string
 *           description: Tên hiển thị
 *         email:
 *           type: string
 *           format: email
 *           description: Địa chỉ email
 *         role:
 *           type: string
 *           enum: [admin, worker, user]
 *           description: Vai trò người dùng
 *         avatar:
 *           type: string
 *           description: URL ảnh đại diện
 *         requiresProfileUpdate:
 *           type: boolean
 *           description: Có cần cập nhật thông tin hồ sơ không
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token để xác thực các request tiếp theo
 *         user:
 *           $ref: '#/components/schemas/UserProfile'
 */

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleSignInRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Lỗi request không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ID token là bắt buộc"
 *       401:
 *         description: Xác thực thất bại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xác thực thất bại"
 */

/**
 * @swagger
 * /api/auth/profile/update:
 *   post:
 *     summary: Cập nhật thông tin hồ sơ sau khi đăng nhập bằng Google
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - gender
 *               - dob
 *               - tel
 *               - location
 *             properties:
 *               username:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               dob:
 *                 type: string
 *                 format: date
 *               tel:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật thông tin thành công"
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 */
