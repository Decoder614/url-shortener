const express = require('express');
const urlRoutes = require('./routes/urlRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('URL Shortener API created by Jaydip');
});

app.use('/api/v1/urls', urlRoutes);

if (require.main === module) {
    const port = 3000;
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

module.exports = app;