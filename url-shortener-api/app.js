const express = require('express');
const urlRoutes = require('./routes/urlRoutes');
const { initDb } = require('./config/db');
const { redirectUrl } = require('./controllers/urlController');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('URL Shortener API created by Jaydip');
});

app.get('/:shortCode', redirectUrl);
app.use('/api/v1/urls', urlRoutes);
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