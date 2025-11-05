const express = require('express');
const http = require('http');
const cors = require('cors');
const { setupConversationListener } = require('./src/config/listener.js');

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: '*',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json());

const ImageRouter = require('./src/routes/ImageRouter');
app.use('/api/images', ImageRouter);

const EmailRouter = require('./src/routes/EmailRouter');
app.use('/api/emails/', EmailRouter);

const AuthRouter = require('./src/routes/AuthRouter');
app.use('/api/auth', AuthRouter);

const ClientRouter = require('./src/routes/ClientRouter');
app.use('/api/users', ClientRouter);

const ServiceRouter = require('./src/routes/ServiceRouter');
app.use('/api/services', ServiceRouter);

const JobRouter = require('./src/routes/JobRouter');
app.use('/api/jobs', JobRouter);

const OrderRouter = require('./src/routes/OrderRouter');
app.use('/api/orders', OrderRouter);

const ScheduleRouter = require('./src/routes/ScheduleRouter');
app.use('/api/schedules', ScheduleRouter);

const ReviewRouter = require('./src/routes/ReviewRouter');
app.use('/api/reviews', ReviewRouter);

const DeviceRouter = require('./src/routes/DeviceRouter');
app.use('/api/devices', DeviceRouter);

const NotificationRouter = require('./src/routes/NotificationRouter');
app.use('/api/notifications', NotificationRouter);

const PaymentRouter = require('./src/routes/PaymentRouter');
app.use('/api/payments', PaymentRouter);


const PolicyRouter = require('./src/routes/PolicyRouter');
app.use('/api/policies', PolicyRouter);

const ChatBotRouter = require('./src/routes/ChatBotRouter');
app.use('/api/chatbot', ChatBotRouter);

const { cleaningJobSchedule, healthcareJobSchedule } = require('./src/notifications/JobNotifications');
const { checkCleaningJob, checkHealthcareJob, checkMaintenanceJob } = require('./src/notifications/JobCancel');

// Promise.all([
//     cleaningJobSchedule(),
//     healthcareJobSchedule(),
//     checkCleaningJob(),
//     checkHealthcareJob(),
//     checkMaintenanceJob()
// ])

const HealthRouter = require('./src/routes/HealthRouter');
app.use('/api', HealthRouter);

const ChatRouter = require('./src/routes/ChatRouter');
app.use('/api/chat', ChatRouter);

// Khởi tạo listener cho tin nhắn
setupConversationListener();
console.log('🔊 Message listener initialized');

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
