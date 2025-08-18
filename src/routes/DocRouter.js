/**
 * @swagger
 * tags:
 *  - name: Email
 *    description: API cho email
 *  - name: Image
 *    description: API cho upload image
 *  - name: User
 *    description: API cho User và Worker
 *  - name: Service
 *    description: API cho các Service
 *  - name: Job
 *    description: API cho các Job
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