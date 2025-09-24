const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'auth_app_db',
    password: 'NewPassword123!',
    port: 5432,
});

client.connect()
    .then(() => console.log('Connected!'))
    .catch(err => console.error('Connection error:', err))
    .finally(() => client.end());
