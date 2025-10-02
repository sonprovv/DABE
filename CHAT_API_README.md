# API Chat 1-1 với Firebase Realtime Database

## ⚠️ Quy tắc nghiệp vụ quan trọng

**Chỉ có thể chat khi có Order được chấp nhận!**

- Worker ứng tuyển vào Job của User → tạo Order với status = 'Pending'
- User chấp nhận Worker → Order status = 'Accepted'
- **Chỉ khi Order status = 'Accepted', Worker và User mới có thể chat với nhau**

### Luồng hoạt động:
1. User đăng Job
2. Worker ứng tuyển → tạo Order (status: Pending)
3. User xem danh sách Worker ứng tuyển và chấp nhận → Order status: Accepted
4. **Lúc này box chat mới xuất hiện cho cả User và Worker**
5. Cả 2 có thể gửi tin nhắn cho nhau

## Cấu hình

### 1. Cài đặt dependencies
Đảm bảo bạn đã cài đặt các package cần thiết:
```bash
npm install firebase-admin express
```

### 2. Cấu hình Firebase Realtime Database

Thêm biến môi trường `FIREBASE_DATABASE_URL` vào file `.env`:
```env
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

Hoặc thay thế trong file `src/config/firebase.js`:
```javascript
databaseURL: "https://your-project-id.firebaseio.com"
```

### 3. Cấu trúc dữ liệu trên Firebase Realtime Database

```
firebase-realtime-db/
├── conversations/
│   └── {conversationId}/
│       ├── info/
│       │   ├── participants: [userId1, userId2]
│       │   ├── lastMessage: "..."
│       │   ├── lastMessageTime: timestamp
│       │   ├── lastMessageSender: userId
│       │   └── updatedAt: ISO string
│       └── messages/
│           └── {messageId}/
│               ├── messageId: string
│               ├── senderId: string
│               ├── receiverId: string
│               ├── message: string
│               ├── type: "text|image|file"
│               ├── timestamp: number
│               ├── isRead: boolean
│               └── createdAt: ISO string
├── userConversations/
│   └── {userId}/
│       └── {conversationId}/
│           ├── otherUserId: string
│           ├── lastMessage: string
│           ├── lastMessageTime: timestamp
│           └── unreadCount: number
└── status/
    └── {userId}/
        ├── state: "online|offline"
        ├── lastChanged: timestamp
        └── timestamp: ISO string
```

## API Endpoints

### 1. Gửi tin nhắn
**POST** `/api/chat/send`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "receiverId": "user123",
  "message": "Xin chào!",
  "type": "text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg123",
    "senderId": "currentUser",
    "receiverId": "user123",
    "message": "Xin chào!",
    "type": "text",
    "timestamp": 1234567890,
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Lấy danh sách tin nhắn
**GET** `/api/chat/messages/:userId?limit=50`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": "msg123",
      "messageId": "msg123",
      "senderId": "user1",
      "receiverId": "user2",
      "message": "Hello",
      "type": "text",
      "timestamp": 1234567890,
      "isRead": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Lấy danh sách conversations
**GET** `/api/chat/conversations`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversations retrieved successfully",
  "data": [
    {
      "conversationId": "user1_user2",
      "otherUserId": "user2",
      "lastMessage": "Hello",
      "lastMessageTime": 1234567890,
      "unreadCount": 3
    }
  ]
}
```

### 3.1. Lấy danh sách users có thể chat (có order được chấp nhận)
**GET** `/api/chat/available-users`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Available chat users retrieved successfully",
  "data": ["userId1", "userId2", "userId3"]
}
```

**Mô tả:** 
- Endpoint này trả về danh sách userID của những người mà user hiện tại có thể chat
- Bao gồm:
  - Nếu user là Worker: danh sách các User đã chấp nhận order của mình
  - Nếu user là User: danh sách các Worker mà mình đã chấp nhận

### 4. Đánh dấu tin nhắn đã đọc
**PUT** `/api/chat/read/:userId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": null
}
```

### 5. Xóa tin nhắn
**DELETE** `/api/chat/message/:conversationId/:messageId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": null
}
```

### 6. Xóa conversation
**DELETE** `/api/chat/conversation/:userId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully",
  "data": null
}
```

### 7. Kiểm tra trạng thái online
**GET** `/api/chat/status/:userId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "User status retrieved",
  "data": {
    "userId": "user123",
    "isOnline": true
  }
}
```

### 8. Cập nhật trạng thái
**POST** `/api/chat/status`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "state": "online"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "userId": "currentUser",
    "state": "online"
  }
}
```

## Tính năng

### ✅ Đã implement:
- ✅ Gửi tin nhắn 1-1
- ✅ Lấy danh sách tin nhắn
- ✅ Lấy danh sách conversations
- ✅ Đánh dấu tin nhắn đã đọc
- ✅ Xóa tin nhắn
- ✅ Xóa conversation
- ✅ Theo dõi trạng thái online/offline
- ✅ Đếm số tin nhắn chưa đọc
- ✅ Tự động cập nhật offline khi disconnect
- ✅ Hỗ trợ nhiều loại tin nhắn (text, image, file)

### 🔄 Có thể mở rộng:
- Real-time listening với Firebase SDK (client-side)
- Gửi tin nhắn có đính kèm file/hình ảnh
- Typing indicator
- Message reactions
- Group chat
- Voice/Video call

## Sử dụng Real-time trên Client

### JavaScript/React Example:
```javascript
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Lắng nghe tin nhắn mới
const conversationId = 'user1_user2';
const messagesRef = ref(database, `conversations/${conversationId}/messages`);

onValue(messagesRef, (snapshot) => {
  const messages = [];
  snapshot.forEach((childSnapshot) => {
    messages.push({
      id: childSnapshot.key,
      ...childSnapshot.val()
    });
  });
  console.log('New messages:', messages);
});

// Lắng nghe trạng thái online
const statusRef = ref(database, `status/${userId}`);
onValue(statusRef, (snapshot) => {
  const status = snapshot.val();
  console.log('User status:', status);
});

// Cleanup khi unmount
off(messagesRef);
off(statusRef);
```

## Security Rules cho Firebase Realtime Database

Thêm rules sau vào Firebase Console:
```json
{
  "rules": {
    "conversations": {
      "$conversationId": {
        ".read": "auth != null && (data.child('info/participants').val().contains(auth.uid))",
        ".write": "auth != null && (data.child('info/participants').val().contains(auth.uid) || !data.exists())"
      }
    },
    "userConversations": {
      "$userId": {
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId"
      }
    },
    "status": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $userId"
      }
    }
  }
}
```

## Testing

### Sử dụng Postman hoặc cURL:

```bash
# Gửi tin nhắn
curl -X POST http://localhost:5000/api/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "user123",
    "message": "Hello!",
    "type": "text"
  }'

# Lấy tin nhắn
curl -X GET http://localhost:5000/api/chat/messages/user123?limit=50 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lấy conversations
curl -X GET http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Lưu ý

1. **Authentication**: Tất cả endpoints đều yêu cầu token xác thực
2. **ConversationId**: Được tạo tự động bằng cách sắp xếp 2 userId theo thứ tự alphabet
3. **Real-time**: Để nhận tin nhắn real-time, client cần implement Firebase SDK và lắng nghe changes
4. **Offline Status**: Tự động set offline khi user disconnect khỏi Firebase
5. **Unread Count**: Tự động tăng khi có tin nhắn mới và reset khi đánh dấu đã đọc

## Troubleshooting

### Lỗi "Permission denied"
- Kiểm tra Firebase Security Rules
- Đảm bảo user đã authenticated

### Tin nhắn không real-time
- API này chỉ cung cấp REST endpoints
- Để có real-time, client cần implement Firebase SDK

### Database URL không đúng
- Kiểm tra biến môi trường `FIREBASE_DATABASE_URL`
- Format: `https://your-project-id.firebaseio.com`
