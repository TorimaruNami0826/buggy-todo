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

// JSONパースエラーを統一した400レスポンスで返すエラーハンドラー
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSONの形式が不正です' });
  }
  next(err);
});

// サーバーを起動する
app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});

module.exports = app;
