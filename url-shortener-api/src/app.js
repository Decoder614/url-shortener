const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const urlRoutes = require('./routes/urlRoutes');
const authRoutes = require('./routes/authRoutes');
const { initDb } = require('./config/db');
const { initRedis } = require('./config/redis');
const { redirectUrl, getAnalyticsData } = require('./controllers/urlController');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('URL Shortener API created by Jaydip');
});

app.use('/api/v1/auth', authRoutes);
app.get('/api/v1/analytics/:shortCode', getAnalyticsData);
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/:shortCode', redirectUrl);
app.use('/api/v1/urls', authMiddleware, urlRoutes);
app.use(errorHandler);

async function startServer() {
  await initDb();
  await initRedis();

  const port = process.env.PORT || 3000;
  return app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };