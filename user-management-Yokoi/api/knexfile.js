// knexfile.js
module.exports = {
development: {
    client: 'pg',
    connection: {
    host: '127.0.0.1',
    user: 'postgres', // 自分のOSのユーザに変更
    password: '07310727',
    database: 'attendancedb'
    },
    migrations: {
    directory: './migrations' // マイグレーションファイルのディレクトリ
    },
    seeds: {
    directory: './seeds' // シードファイルのディレクトリ
    }
}
};
