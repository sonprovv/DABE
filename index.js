const express = require('express')
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require('./src/config/swagger');

const app = express();
app.use(cors());
app.use(express.json());

app.get("/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

// Route Swagger UI dùng CDN
app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Swagger UI</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          const ui = SwaggerUIBundle({
            url: '/swagger.json',
            dom_id: '#swagger-ui',
          });
        </script>
      </body>
    </html>
  `);
});

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running...')
});
