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
 *  - name: Order
 *    description: API cho các Order
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
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/users/me:
 *   post:
 *      summary: Lấy thông tin người dùng sau khi đăng nhập
 *      tags: [User]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - password
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: kain411thien@gmail.com
 *                          password:
 *                              type: string
 *                              example: 411411
 *      responses:
 *          200:
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/users/create:
 *  post:
 *      summary: Tạo người dùng mới dùng khi đăng ký
 *      tags: [User]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required: 
 *                          - email
 *                          - password
 *                          - username
 *                          - avatar
 *                          - role
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: test@gmail.com
 *                          password:
 *                              type: string
 *                              example: 411411
 *                          username:
 *                              type: string
 *                              nullable: true
 *                              example: null
 *                          avatar:
 *                              type: string
 *                              nullable: true
 *                              example: null
 *                          role:
 *                              type: string
 *                              example: user
 *      responses:
 *          200:
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/users/forgot-password:
 *  put:
 *      summary: Quên mật khẩu
 *      tags: [User]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - newPassword
 *                          - confirmPassword
 *                          - code
 *                          - codeEnter
 *                      properties:
 *                          email:
 *                              type: string
 *                              example: kain411thien@gmail.com
 *                          newPassword:
 *                              type: string
 *                              example: 411411
 *                          confirmPassword:
 *                              type: string
 *                              example: 411411
 *                          code:
 *                              type: string
 *                              example: 123456
 *                          codeEnter:
 *                              type: string
 *                              example: 123456
 *      responses:
 *          200:
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/users/change-password:
 *  put:
 *      summary: Quên mật khẩu
 *      tags: [User]
 *      sercurity:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - newPassword
 *                          - confirmPassword
 *                          - code
 *                          - codeEnter
 *                      properties:
 *                          newPassword:
 *                              type: string
 *                              example: 411411
 *                          confirmPassword:
 *                              type: string
 *                              example: 411411
 *                          code:
 *                              type: string
 *                              example: 123456
 *                          codeEnter:
 *                              type: string
 *                              example: 123456
 *      responses:
 *          200:
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/users/update:
 *  put:
 *      summary: Cập nhật thông tin người dùng
 *      tags: [User]
 *      sercurity:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          200: 
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/users/delete:
 *  delete:
 *      summary: Xóa người dùng
 *      tags: [User]
 *      sercurity:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - userID
 *                      properties:
 *                          userID:
 *                              type: string
 *                              example: idUser001
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
 * /api/jobs/{serviceType}:
 *  get:
 *      summary: Thông tin công việc
 *      tags: [Job]
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
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/jobs/user/{userID}:
 *  get:
 *      summary: Tất cả công việc người dùng dùng đăng tải
 *      tags: [Job]
 *      parameters:
 *          - in: path
 *            name: userID
 *            required: true
 *            schema:
 *              type: string
 *              example: idUser001
 *      responses:
 *          200:
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/jobs/type/cleaning:
 *  post:
 *      summary: Tạo công việc mới
 *      tags: [Job]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user:
 *                              $ref: '#/components/schemas/User'
 *                          serviceType:
 *                              type: string
 *                              example: CLEANING
 *                          startTime:
 *                              type: string
 *                              example: 14:00
 *                          price:
 *                              type: integer
 *                              format: int64
 *                              example: 500000
 *                          workerQuantity:
 *                              type: integer
 *                              format: int32
 *                          isWeek:
 *                              type: boolean
 *                              example: true
 *                          dayOfWeek:
 *                              type: array
 *                              items:
 *                                  type: string
 *                              example: [MONDAY, FRIDAY, SUNDAY]
 *                          isCooking:
 *                              type: boolean
 *                              example: false
 *                          isIroning:
 *                              type: boolean
 *                              example: false
 *                          duration:
 *                              $ref: '#/components/schemas/Duration'
 *                          services:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/CleaningService'
 *                              example:
 *                                  - uid: idService01
 *                                    serviceType: CLEANING
 *                                    serviceName: Phòng khách
 *                                    image: livingroom.png
 *                                    tasks: [ Lau và quét nhà, Lau tất cả các bề mặt ]
 *                                  - uid: idService02
 *                                    serviceType: CLEANING
 *                                    serviceName: Phòng ngủ
 *                                    image: bedroom.png
 *                                    tasks: [ Lau tất cả các bề mặt, Sắp xếp giường, Thay ga ]
 *      responses:
 *          200:
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/jobs/type/healthcare:
 *  post:
 *      summary: Tạo công việc mới
 *      tags: [Job]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user:
 *                              $ref: '#/components/schemas/User'
 *                          serviceType:
 *                              type: string
 *                              example: CLEANING
 *                          startTime:
 *                              type: string
 *                              example: 14:00
 *                          price:
 *                              type: integer
 *                              format: int64
 *                              example: 500000
 *                          workerQuantity:
 *                              type: integer
 *                              format: int32
 *                          isWeek:
 *                              type: boolean
 *                              example: true
 *                          dayOfWeek:
 *                              type: array
 *                              items:
 *                                  type: string
 *                              example: [MONDAY, FRIDAY, SUNDAY]
 *                          shift:
 *                              $ref: '#/components/schemas/Shift'
 *                          services:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      healcareService:
 *                                          $ref: '#/components/schemas/HealthcareService'
 *                                      quantity:
 *                                          type: integer
 *                                          format: int32
 *                                          example: 2
 *                              example:
 *                                  - healcareService:
 *                                      uid: idHealthcareService01
 *                                      serviceType: HEALTHCARE
 *                                      serviceName: Trẻ em
 *                                      duties: [ Cho ăn uống đúng giờ, Chơi cùng với trẻ ]
 *                                      excludedTasks: [ Tránh xa thiết bị điện ]
 *                                    quantity: 2
 *                                  - healthcareService:
 *                                      uid: idHealthcareService02
 *                                      serviceType: HEALTHCARE
 *                                      serviceName: Người khuyết tật
 *                                      duties: [ Cho ăn uống đúng giờ, Trò chuyện cùng ]
 *                                      excludedTasks: [ Không làm gì cả ]
 *                                    quantity: 3
 *      responses:
 *          200:
 *              description: Thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/orders/create:
 *  post:
 *      summary: Worker apply job
 *      tags: [Order]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          worker:
 *                              $ref: '#/components/schemas/Worker'
 *                          jobID:
 *                              type: string
 *                              example: idJob001
 *                          serviceType:
 *                              type: string
 *                              enum: [CLEANING, HEALTHCARE]
 *                              example: CLEANING
 *      responses:
 *          200:
 *              description: Tạo order thành công
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/orders/job/{jobID}:
 *  get:
 *      summary: Dành cho user khi nhấn vào job của mình sẽ xem được các worker apply
 *      tags: [Order]
 *      parameters:
 *          - in: path
 *            name: jobID
 *            required: true
 *            schema:
 *              type: string
 *              example: qkTwWiWOaiv9G2WIVKHt
 *      responses:
 *          200:
 *              description: Thông tin các job của người dùng tạo
 *          400:
 *              description: Không thành công
 */

/**
 * @swagger
 * /api/orders/worker/{workerID}:
 *  get:
 *      summary: Dành cho worker xem các công việc mình apply và thông tin công việc
 *      tags: [Order]
 *      parameters:
 *          - in: path
 *            name: workerID
 *            required: true
 *            schema:
 *              type: string
 *              example: uLYZtX96AHM4fGiLO5ioydc32i02
 *      responses:
 *          200:
 *              description: Thông tin các job worker apply
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
 *                  example: iEJgbv29ANeqtR2CE5iWWqWs3My2
 *              username:
 *                  type: string
 *                  example: kain411thien
 *              gender:
 *                  type: string
 *                  example: Nam
 *              dob:
 *                  type: string
 *                  example: 01/01/1990
 *              avatar:
 *                  type: string
 *                  example: https://res.cloudinary.com/dvofgx21o/image/upload/v1754337546/jobs/byhangkho4twacw1owri.png
 *              email:
 *                  type: string
 *                  example: kain411thien@gmail.com
 *              tel:
 *                  type: string
 *                  example: 0123456789
 *              location:
 *                  type: string
 *                  example: Chưa cập nhật
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
