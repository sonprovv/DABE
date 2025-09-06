const express = require('express')
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { swaggerUi, swaggerSpec } = require('./src/config/swagger');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const ImageRouter = require('./src/routes/ImageRouter');
app.use('/api/images', ImageRouter);

const EmailRouter = require('./src/routes/EmailRouter');
app.use('/api/emails/', EmailRouter);

const UserRouter = require('./src/routes/UserRouter');
app.use('/api/users', UserRouter);

const ServiceRouter = require('./src/routes/ServiceRouter');
app.use('/api/services', ServiceRouter);

const JobRouter = require('./src/routes/JobRouter');
app.use('/api/jobs', JobRouter);

const OrderRouter = require('./src/routes/OrderRouter');
app.use('/api/orders', OrderRouter);

const ReviewRouter = require('./src/routes/ReviewRouter');
app.use('/api/reviews', ReviewRouter);

const userSockets = require('./src/notifications/userSockets');
const io = new Server(server, {
    cors: { origin: "*" }
});

io.on("connection", (socket) => {
    console.log("Client connected: ", socket.id);

    socket.on("register", (userID) => {
        userSockets.set(userID, socket);
        socket.emit('createSocket', {
            message: 'Emit thành công'
        })
        console.log(`User ${userID} register with socket ${socket.id}`);
    })

    socket.on("disconnect", () => {
        for (let [userID, s] of userSockets.entries()) {
            if (s.id === socket.id) {
                userSockets.delete(userID);
                console.log(`User ${userID} disconnected`);
                break;
            }
        }
    })
})

const { cleaningJobSchedule, healthcareJobSchedule } = require('./src/notifications/JobNotifications');
cleaningJobSchedule(io, userSockets);
healthcareJobSchedule(io, userSockets);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('Server running...')
});