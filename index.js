import express from 'express';
import pool from './db.js';

const app = express();
const PORT = 3000;

app.use(express.json());


app.get('/', (req, res) => {
  try {
    res.send('Hello, World!');
  } catch (error) {
    res.status(500).send('Ошибка на сервере');
  }
});

app.post('/', (req, res) => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Данные не были отправлены' });
  }

  res.status(200).json({ message: 'Данные получены', data: data });
});

app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error.message);
    res.status(500).json({ error: 'Не удалось получить продукты' });
  }
});

app.post('/products', async (req, res) => {
  const { name, price } = req.body || {};


  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Нужно передать name и price' });
  }

  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'price должен быть неотрицательным числом' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, price) VALUES (?, ?)',
      [name, price]
    );

    res.status(201).json({
      message: 'Продукт успешно добавлен',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Ошибка при добавлении продукта:', error.message);
    res.status(500).json({ error: 'Не удалось добавить продукт' });
  }
});


app.use((req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.url} не найден` });
});


app.use((err, req, res, next) => {
  console.error('Ошибка:', err.message);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
  }

  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});