// TODOのCRUD操作を担当するルーターモジュール
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /todos
router.get('/', async (req, res) => {
  try {
    const { completed } = req.query;
    let query = 'SELECT * FROM todos ORDER BY created_at DESC';
    const params = [];
    if (completed !== undefined) {
      query = 'SELECT * FROM todos WHERE completed = $1 ORDER BY created_at DESC';
      params.push(completed === 'true');
    }
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('GET /todos エラー:', err.message);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// GET /todos/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'TODOが見つかりません' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('GET /todos/:id エラー:', err.message);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// POST /todos
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'titleは必須です' });
    }
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /todos エラー:', err.message);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// PATCH /todos/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    if (title === undefined && completed === undefined) {
      return res.status(400).json({ error: '更新するフィールドがありません' });
    }
    const existing = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'TODOが見つかりません' });
    }
    const updatedTitle = title !== undefined ? title.trim() : existing.rows[0].title;
    const updatedCompleted = completed !== undefined ? completed : existing.rows[0].completed;
    const result = await pool.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [updatedTitle, updatedCompleted, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('PATCH /todos/:id エラー:', err.message);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// DELETE /todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'TODOが見つかりません' });
    }
    res.status(200).json({ message: '削除しました' });
  } catch (err) {
    console.error('DELETE /todos/:id エラー:', err.message);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;
