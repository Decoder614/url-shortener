const express = require('express');
const urlRoutes = require('./routes/urlRoutes');
const { initDb } = require('./config/db');
const { redirectUrl, getAnalyticsData, register, login } = require('./controllers/urlController');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('URL Shortener API created by Jaydip');
});

app.post('/api/v1/auth/register', register);
app.post('/api/v1/auth/login', login);
app.get('/api/v1/analytics/:shortCode', getAnalyticsData);
app.get('/:shortCode', redirectUrl);
app.use('/api/v1/urls', authMiddleware, urlRoutes);
app.use(errorHandler);

async function startServer() {
    await initDb();

    if (require.main === module) {
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    }
}

startServer();

module.exports = app;