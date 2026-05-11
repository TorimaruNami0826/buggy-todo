// アプリケーションのエントリポイント
// Expressサーバーとルーティングをここでまとめてセットアップする
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// JSONリクエストボディを解析するミドルウェア
app.use(express.json());

// publicフォルダ内の静的ファイル（HTML/CSS/JS）を配信する
app.use(express.static(path.join(__dirname, '../public')));

// TODOのCRUDルートを /todos パスにマウントする
const todosRouter = require('./routes/todos');
app.use('/todos', todosRouter);

// サーバーを起動する
app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});

module.exports = app;
