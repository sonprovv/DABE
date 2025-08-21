const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require('./src/config/swagger');

const app = express();
app.use(cors());
app.use(express.json());

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

// ❌ KHÔNG dùng app.listen trên Vercel
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log('Server running...'));

module.exports = app; // ✅ export app cho @vercel/node
