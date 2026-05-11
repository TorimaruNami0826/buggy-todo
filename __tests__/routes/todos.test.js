// TODOルートのユニットテスト
// DBはjest.mockでモックし、実際のPostgreSQLには接続しない
const request = require('supertest');
const app = require('../../src/index');

// src/db/pool.js をモックする
jest.mock('../../src/db/pool', () => ({
  query: jest.fn(),
}));

const pool = require('../../src/db/pool');

// 各テスト前にモックをリセットする
beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────
// GET /todos
// ─────────────────────────────
describe('GET /todos', () => {
  test('正常系：TODO一覧を200で返す', async () => {
    // Arrange
    const mockTodos = [
      { id: 1, title: 'テストTODO1', completed: false },
      { id: 2, title: 'テストTODO2', completed: true },
    ];
    pool.query.mockResolvedValue({ rows: mockTodos });

    // Act
    const res = await request(app).get('/todos');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('正常系：completedフィルタが効く', async () => {
    // Arrange
    pool.query.mockResolvedValue({ rows: [{ id: 1, title: 'テスト', completed: true }] });

    // Act
    const res = await request(app).get('/todos?completed=true');

    // Assert
    expect(res.status).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE completed'),
      [true]
    );
  });

  test('異常系：DBエラー時に500を返す', async () => {
    // Arrange
    pool.query.mockRejectedValue(new Error('DB接続エラー'));

    // Act
    const res = await request(app).get('/todos');

    // Assert
    expect(res.status).toBe(500);
  });
});

// ─────────────────────────────
// GET /todos/:id
// ─────────────────────────────
describe('GET /todos/:id', () => {
  test('正常系：存在するIDのTODOを200で返す', async () => {
    // Arrange
    pool.query.mockResolvedValue({ rows: [{ id: 1, title: 'テスト', completed: false }] });

    // Act
    const res = await request(app).get('/todos/1');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('異常系：存在しないIDの場合404を返す', async () => {
    // Arrange
    pool.query.mockResolvedValue({ rows: [] });

    // Act
    const res = await request(app).get('/todos/999');

    // Assert
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────
// POST /todos
// ─────────────────────────────
describe('POST /todos', () => {
  test('正常系：TODOを作成して201を返す', async () => {
    // Arrange
    const newTodo = { id: 1, title: '新しいTODO', completed: false };
    pool.query.mockResolvedValue({ rows: [newTodo] });

    // Act
    const res = await request(app)
      .post('/todos')
      .send({ title: '新しいTODO' });

    // Assert
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('新しいTODO');
  });

  test('異常系：titleが空の場合400を返す', async () => {
    // Act
    const res = await request(app)
      .post('/todos')
      .send({ title: '' });

    // Assert
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('異常系：titleがない場合400を返す', async () => {
    // Act
    const res = await request(app)
      .post('/todos')
      .send({});

    // Assert
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────
// PATCH /todos/:id
// ─────────────────────────────
describe('PATCH /todos/:id', () => {
  test('正常系：completedをtrueに更新して200を返す', async () => {
    // Arrange
    const existing = { id: 1, title: 'テスト', completed: false };
    const updated  = { id: 1, title: 'テスト', completed: true };
    pool.query
      .mockResolvedValueOnce({ rows: [existing] }) // SELECT
      .mockResolvedValueOnce({ rows: [updated] });  // UPDATE

    // Act
    const res = await request(app)
      .patch('/todos/1')
      .send({ completed: true });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  test('異常系：存在しないIDの場合404を返す', async () => {
    // Arrange
    pool.query.mockResolvedValue({ rows: [] });

    // Act
    const res = await request(app)
      .patch('/todos/999')
      .send({ completed: true });

    // Assert
    expect(res.status).toBe(404);
  });

  test('異常系：更新フィールドが何もない場合400を返す', async () => {
    // Act
    const res = await request(app)
      .patch('/todos/1')
      .send({});

    // Assert
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────
// DELETE /todos/:id
// ─────────────────────────────
describe('DELETE /todos/:id', () => {
  test('正常系：TODOを削除して204を返す', async () => {
    // Arrange
    pool.query.mockResolvedValue({ rowCount: 1 });

    // Act
    const res = await request(app).delete('/todos/1');

    // Assert
    expect(res.status).toBe(204);
  });

  test('異常系：存在しないIDの場合404を返す', async () => {
    // Arrange
    pool.query.mockResolvedValue({ rowCount: 0 });

    // Act
    const res = await request(app).delete('/todos/999');

    // Assert
    expect(res.status).toBe(404);
  });
});
