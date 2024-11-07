// knexfile.js
module.exports = {
    development: {
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: '07310727',
        database: 'attendancedb',
        client_encoding: 'UTF8'
    },
    migrations: {
        directory: './migrations'
    },
    seeds: {
        directory: './seeds'
    }
    }
};
