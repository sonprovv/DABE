const express = require('express')
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ImageRouter = require('./src/routes/ImageRouter');
app.use('/api/images', ImageRouter);

const EmailRouter = require('./src/routes/EmailRouter');
app.use('/api/emails/', EmailRouter);

const UserRouter = require('./src/routes/UserRouter');
app.use('/api/users', UserRouter);

const CategoryRouter = require('./src/routes/CategoryRouter');
app.use('/api/categories', CategoryRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running...')
});