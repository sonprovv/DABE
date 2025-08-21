/**
 * @swagger
 * tags:
 *  - name: Email
 *    description: API gửi email xác thực
 *  - name: Image
 *    description: API tải lên hình ảnh
 *  - name: User
 *    description: API quản lý người dùng
 *  - name: Service
 *    description: API quản lý dịch vụ
 *  - name: Job
 *    description: API quản lý công việc
 */

/**
 * @swagger
 * /api/emails/send:
 *   post:
 *      summary: Gửi mã xác thực qua email
 *      tags: [Email]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: tzei@gmail.com
 *      responses:
 *          200:
 *              description: Thành công
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  example: Thành công
 *                              code:
 *                                  type: string
 *                                  example: 12345
 *          400:
 *              description: Không thành công
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *      summary: Lấy thông tin người dùng sau khi đăng nhập
 *      tags: [User]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/services/{serviceType}:
 *  get:
 *      summary: Thông tin tất cả service của từng loại category
 *      tags: [Service]
 *      parameters:
 *          - in: path
 *            name: serviceType
 *            required: true
 *            schema:
 *              type: string
 *              enum: [cleaning, healthcare]
 *              example: cleaning
 *      responses:
 *          200:
 *              description: Thông tin service và duration của từng loại
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: Tải lên hình ảnh
 *     tags: [Image]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh cần tải lên (JPG, PNG, JPEG, GIF, WEBP)
 *     responses:
 *       200:
 *         description: Tải lên thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Đường dẫn đến ảnh đã tải lên
 *       400:
 *         description: Không có file ảnh hoặc định dạng không hợp lệ
 *       500:
 *         description: Lỗi khi tải lên ảnh
 */

/**
 * @swagger
 * /api/jobs/{serviceType}:
 *   post:
 *     summary: Tạo công việc mới
 *     tags: [Job]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *         description: Loại dịch vụ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Tạo công việc thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */

/**
 * @swagger
 * /api/jobs/{serviceType}:
 *   get:
 *     summary: Lấy danh sách công việc theo loại dịch vụ
 *     tags: [Job]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *         description: Loại dịch vụ cần lấy công việc
 *     responses:
 *       200:
 *         description: Danh sách công việc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Tạo người dùng mới (Chỉ dành cho admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Tạo người dùng thành công
 */

/**
 * @swagger
 * /api/users/forgot-password:
 *   put:
 *     summary: Yêu cầu đặt lại mật khẩu
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Đã gửi email đặt lại mật khẩu
 */

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 */

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Xóa người dùng (Chỉ dành cho admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người dùng cần xóa
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công
 */

/**
 * @swagger
 * components:
 *  schemas:
 *      SuccessResponse:
 *          type: object
 *          properties:
 *              success:
 *                  type: boolean
 *                  example: true
 *              message:
 *                  type: string
 *                  example: Thành công
 *      ErrorResponse:
 *          type: object
 *          properties:
 *              success:
 *                  type: boolean
 *                  example: false
 *              error:
 *                  type: string
 *                  example: Lỗi lòi mắt đây này
 *      User:
 *          type: object
 *          properties:
 *              uid:
 *                  type: string
 *                  example: iEvnh54hdiso
 *              username:
 *                  type: string
 *                  example: Tzei
 *              gender:
 *                  type: string
 *                  example: Nam
 *              dob:
 *                  type: string
 *                  example: 03/02/2004
 *              avatar:
 *                  type: string
 *                  example: avatar.png
 *              email:
 *                  type: string
 *                  example: tzei@gmail.com
 *              tel:
 *                  type: string
 *                  example: 0123456789
 *              location:
 *                  type: string
 *                  example: Chí Hòa, Hưng Hà, Thái Bình
 *              role:
 *                  type: string
 *                  example: user
 *      Worker:
 *          allOf:
 *            - $ref: '#/components/schemas/User'
 *            - type: object
 *              properties:
 *                  role:
 *                      type: string
 *                      example: worker
 *      Shift:
 *          type: object
 *          properties:
 *              uid:
 *                  type: string
 *                  example: idTimehhh411
 *              workingHour:
 *                  type: integer
 *                  format: int32
 *                  example: 2
 *              fee:
 *                  type: integer
 *                  format: int64
 *                  example: 120000
 *      Duration:
 *          allOf:
 *            - $ref: '#/components/schemas/Shift' 
 *            - type: object
 *              properties:
 *                  description:
 *                      type: string
 *                      example: Đây là mô tả
 *      Service:
 *          type: object
 *          properties:
 *              uid:
 *                  type: string
 *                  example: idService
 *              serviceType:
 *                  type: string
 *                  example: CLEANING
 *              serviceName:
 *                  type: string
 *                  example: Tên của service
 *      CleaningService:
 *          allOf:
 *            - $ref: '#/components/schemas/Service'
 *            - type: object
 *              properties:
 *                  serviceType:
 *                      type: string
 *                      example: CLEANING | HEALTHCARE
 *                  image:
 *                      type: string
 *                      example: image_service.png
 *                  tasks:
 *                      type: array
 *                      items:
 *                          type: string
 *                      example:
 *                          - Lau dọn phòng
 *                          - Quét và lau sàn
 *                          - Đổ rác
 *      HealthcareService:
 *          allOf:
 *            - $ref: '#/components/schemas/Service'
 *            - type: object
 *              properties:
 *                  serviceType:
 *                      type: string
 *                      example: HEALTHCARE
 *                  duties:
 *                      type: array
 *                      items:
 *                          type: string
 *                      example:
 *                          - Trông nom
 *                          - Nấu ăn...
 *                  excludedTasks:
 *                      type: array
 *                      items:
 *                          type: string
 *                      example:
 *                          - Tránh xa thiết bị điện
 *                          - Không tiếp xúc thiết bị gây nguy hiểm
 *      Job:
 *          type: object
 *          properties:
 *              uid:
 *                  type: string
 *                  example: idJob
 *              user:
 *                  $ref: '#/components/schemas/User'
 *              serviceType:
 *                  type: string
 *                  example: CLEANING | HEALTHCARE
 *              workerQuantity:
 *                  type: integer
 *                  format: int32
 *                  example: 2
 *              status:
 *                  type: string
 *                  example: Waiting | Processing | Completed
 *              price:
 *                  type: integer
 *                  format: int64
 *                  example: 320000
 *              isWeek:
 *                  type: boolean
 *                  example: true
 *              dayOfWeek:
 *                  type: array
 *                  items:
 *                      type: string
 *                  example:
 *                      - MONDAAY
 *                      - TUESDAY
 *                      - WEDNESDAY
 *                      - THURSDAY
 *                      - FRIDAY
 *                      - SATURDAY
 *                      - SUNDAY
 *              createdAt:
 *                  type: string
 *                  example: 18/08/2025
 *      CleaningJob:
 *          allOf:
 *            - $ref: '#/components/schemas/Job'
 *            - type: object
 *              properties:
 *                  serviceType:
 *                      type: string
 *                      example: CLEANING
 *                  duration:
 *                      $ref: '#/components/schemas/Duration'
 *                  services:
 *                      type: array
 *                      items:
 *                          $ref: '#/components/schemas/CleaningService'
 *                      example:
 *                          - uid: idService01
 *                            serviceType: CLEANING
 *                            serviceName: Phòng khách
 *                            image: livingroom.png
 *                            tasks: [ Lau và quét nhà, Lau tất cả các bề mặt ]
 *                          - uid: idService02
 *                            serviceType: CLEANING
 *                            serviceName: Phòng ngủ
 *                            image: bedroom.png
 *                            tasks: [ Lau tất cả các bề mặt, Sắp xếp giường, Thay ga ]
 *                  isCooking:
 *                      type: boolean
 *                      example: true
 *                  isIroning:
 *                      type: boolean
 *                      example: false
 *      HealthcareJob:
 *          allOf:
 *            - $ref: '#/components/schemas/Job'
 *            - type: object
 *              properties:
 *                  shift:
 *                      $ref: '#/components/schemas/Shift'
 *                  services:
 *                      type: array
 *                      items:
 *                          type: object
 *                          properties:
 *                              healcareService:
 *                                  $ref: '#/components/schemas/HealthcareService'
 *                              quantity:
 *                                  type: integer
 *                                  format: int32
 *                                  example: 2
 *                      example:
 *                          - healcareService:
 *                              uid: idHealthcareService01
 *                              serviceType: HEALTHCARE
 *                              serviceName: Trẻ em
 *                              duties: [ Cho ăn uống đúng giờ, Chơi cùng với trẻ ]
 *                              excludedTasks: [ Tránh xa thiết bị điện ]
 *                            quantity: 2
 *                          - healthcareService:
 *                              uid: idHealthcareService02
 *                              serviceType: HEALTHCARE
 *                              serviceName: Người khuyết tật
 *                              duties: [ Cho ăn uống đúng giờ, Trò chuyện cùng ]
 *                              excludedTasks: [ Không làm gì cả ]
 *                            quantity: 3
 */
