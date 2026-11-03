require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: [
        'http://localhost:4200',
        'https://smart-wall-paint-frontend.onrender.com'
    ]
}));

app.use(express.json({ limit: '20mb' }));

app.use('/api', require('./routes'));

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

app.use((e, req, res, next) => {
    if (e.name === 'CastError') e.status = 400;

    res.status(
        e.status || 500
    ).json({
        message: e.status
            ? e.message
            : (e.name === 'CastError' ? 'Invalid id' : 'Server error')
    });

    if (!e.status) console.error(e);
});

require('./config/db')()
    .then(() => app.listen(
        process.env.PORT || 5000,
        () => console.log('API on ' + (process.env.PORT || 5000))
    ))
    .catch(e => {
        console.error(e.message);
        process.exit(1);
    });