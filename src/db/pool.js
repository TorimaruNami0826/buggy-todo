// PostgreSQLへの接続プールを管理するモジュール
// Poolを使うことで毎回接続・切断を繰り返さずにパフォーマンスを向上させる
const { Pool } = require('pg');
require('dotenv').config();

// 環境変数から接続情報を読み込む（ローカルと本番で設定を切り替えられる）
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'todo_db',
  user:     process.env.DB_USER     || 'todo_user',
  password: process.env.DB_PASSWORD || '',
});

// 起動時に接続確認を行う
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('PostgreSQL接続エラー:', err.message);
  } else {
    console.log('PostgreSQL接続成功');
  }
});

module.exports = pool;
