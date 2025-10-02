# Hướng dẫn tích hợp Chat vào hệ thống Job-Worker

## 📋 Tổng quan

API Chat đã được tích hợp với logic nghiệp vụ của hệ thống:
- **User** đăng Job
- **Worker** ứng tuyển → tạo Order
- **User** chấp nhận Worker → Order status = 'Accepted'
- **Box chat xuất hiện** cho cả User và Worker

## 🔄 Luồng tích hợp

### 1. Khi User chấp nhận Order

Trong `OrderController.putStatusByUID`, khi User chấp nhận Worker:

```javascript
// File: src/controllers/OrderController.js
const putStatusByUID = async (req, res) => {
    const { uid, status } = req.body;
    
    if (status === 'Accepted') {
        // Order được chấp nhận
        const updatedOrder = await OrderService.putStatusByUID(uid, status);
        
        // Gửi notification
        await orderStatusNotification(updatedOrder);
        
        // ✅ Lúc này User và Worker có thể chat với nhau
        // Frontend có thể hiển thị button "Nhắn tin" hoặc box chat
    }
}
```

### 2. Hiển thị danh sách người có thể chat

**Frontend nên gọi API này để lấy danh sách:**

```javascript
// GET /api/chat/available-users
const response = await fetch('/api/chat/available-users', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

const { data } = await response.json();
// data = ["userId1", "userId2", "userId3"]

// Hiển thị danh sách này trong UI
```

### 3. Trong màn hình Order Details

Khi User xem chi tiết Order đã chấp nhận:

```javascript
// Kiểm tra status của order
if (order.status === 'Accepted') {
    // Hiển thị button "Nhắn tin với Worker"
    <button onClick={() => openChat(order.workerID)}>
        💬 Nhắn tin với Worker
    </button>
}
```

Khi Worker xem chi tiết Order đã được chấp nhận:

```javascript
// Kiểm tra status của order
if (order.status === 'Accepted') {
    // Hiển thị button "Nhắn tin với User"
    <button onClick={() => openChat(order.job.userID)}>
        💬 Nhắn tin với User
    </button>
}
```

### 4. Trong màn hình Job Details (cho User)

```javascript
// GET /api/orders/job/:jobID
const orders = await getOrdersByJobID(jobID);

// Lọc các orders đã đ��ợc chấp nhận
const acceptedOrders = orders.filter(o => o.status === 'Accepted');

acceptedOrders.forEach(order => {
    // Hiển thị button chat cho mỗi worker đã chấp nhận
    <div>
        <span>{order.worker.username}</span>
        <button onClick={() => openChat(order.worker.uid)}>
            💬 Chat
        </button>
    </div>
});
```

### 5. Trong màn hình Worker's Orders

```javascript
// GET /api/orders/worker/:workerID
const orders = await getOrdersByWorkerID(workerID);

// Lọc các orders đã được chấp nhận
const acceptedOrders = orders.filter(o => o.status === 'Accepted');

acceptedOrders.forEach(order => {
    // Hiển thị button chat với user
    <div>
        <span>{order.job.user.username}</span>
        <button onClick={() => openChat(order.job.userID)}>
            💬 Chat
        </button>
    </div>
});
```

## 💡 Gợi ý UI/UX

### 1. Badge thông báo tin nhắn chưa đọc

```javascript
// Lấy conversations để đếm unread
const { data: conversations } = await fetch('/api/chat/conversations', {
    headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

// Hiển thị badge
<button>
    💬 Tin nhắn
    {totalUnread > 0 && <span className="badge">{totalUnread}</span>}
</button>
```

### 2. Màn hình Chat List

```javascript
function ChatListScreen() {
    const [conversations, setConversations] = useState([]);
    
    useEffect(() => {
        loadConversations();
    }, []);
    
    const loadConversations = async () => {
        const response = await fetch('/api/chat/conversations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const { data } = await response.json();
        setConversations(data);
    };
    
    return (
        <div>
            <h2>Tin nhắn</h2>
            {conversations.map(conv => (
                <div key={conv.conversationId} onClick={() => openChat(conv.otherUserId)}>
                    <div>{conv.otherUserId}</div>
                    <div>{conv.lastMessage}</div>
                    {conv.unreadCount > 0 && <span>{conv.unreadCount}</span>}
                </div>
            ))}
        </div>
    );
}
```

### 3. Màn hình Chat 1-1

```javascript
function ChatScreen({ otherUserId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    useEffect(() => {
        loadMessages();
        // Đánh dấu đã đọc
        markAsRead();
        
        // Poll messages mỗi 3 giây (hoặc dùng Firebase realtime)
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [otherUserId]);
    
    const loadMessages = async () => {
        const response = await fetch(`/api/chat/messages/${otherUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const { data } = await response.json();
        setMessages(data);
    };
    
    const markAsRead = async () => {
        await fetch(`/api/chat/read/${otherUserId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    };
    
    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        
        await fetch('/api/chat/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                receiverId: otherUserId,
                message: newMessage,
                type: 'text'
            })
        });
        
        setNewMessage('');
        loadMessages();
    };
    
    return (
        <div>
            <div className="messages">
                {messages.map(msg => (
                    <div key={msg.id} className={msg.senderId === currentUserId ? 'sent' : 'received'}>
                        <p>{msg.message}</p>
                        <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Gửi</button>
            </div>
        </div>
    );
}
```

## 🎯 Các điểm cần lưu ý

### 1. Kiểm tra quyền chat

API đã tự động kiểm tra, nhưng frontend nên:
- Chỉ hiển thị button chat khi `order.status === 'Accepted'`
- Xử lý lỗi 403 nếu user cố gắng chat với người không có order

### 2. Real-time updates

Có 2 cách:
- **Polling**: Gọi API mỗi vài giây (đơn giản, đã implement trong example)
- **Firebase Realtime**: Lắng nghe changes trực tiếp (tốt hơn, cần setup Firebase SDK ở client)

### 3. Notification khi có tin nhắn mới

Có thể tích hợp với hệ thống notification hiện tại:

```javascript
// Trong NotificationService, thêm function mới
async function sendChatNotification(receiverId, senderName, message) {
    await db.collection('notifications').add({
        userID: receiverId,
        title: `Tin nhắn mới từ ${senderName}`,
        content: message,
        type: 'chat',
        isRead: false,
        createdAt: new Date()
    });
}
```

### 4. Tích hợp với Socket.IO (nếu có)

Nếu project đã dùng Socket.IO cho notifications, có thể emit event:

```javascript
// Trong ChatService.sendMessage
io.to(receiverId).emit('new_message', {
    senderId,
    message,
    timestamp: Date.now()
});
```

## 📱 Responsive Design

Gợi ý layout:
- **Desktop**: Split view (danh sách conversations bên trái, chat bên phải)
- **Mobile**: Full screen cho từng màn hình, có back button

## 🔐 Security Checklist

- ✅ Tất cả endpoints đều có `verifyToken` middleware
- ✅ Kiểm tra order được chấp nhận trước khi cho phép chat
- ✅ Chỉ người gửi mới có thể xóa tin nhắn của mình
- ✅ Firebase Security Rules đã được cấu hình

## 🚀 Next Steps

1. **Thêm vào Navigation**: Thêm menu "Tin nhắn" vào navbar
2. **Badge notification**: Hiển thị số tin nhắn chưa đọc
3. **Push notification**: Gửi thông báo khi có tin nhắn mới
4. **Upload ảnh**: Tích hợp với ImageController để gửi ảnh
5. **Typing indicator**: Hiển thị "đang nhập..."
6. **Message reactions**: Thêm emoji reactions
7. **Voice messages**: Ghi âm và gửi tin nhắn thoại

## 📞 Support

Nếu cần hỗ trợ thêm về:
- Tích hợp Firebase Realtime Database ở client
- Setup Socket.IO cho real-time chat
- Thêm tính năng upload file/ảnh trong chat
- Tối ưu performance

Hãy tham khảo file `CHAT_API_README.md` để biết chi tiết về API endpoints.
