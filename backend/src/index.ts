import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRouter = require('./routes/auth').default;
const postsRouter = require('./routes/posts').default;
const usersRouter = require('./routes/users').default;
const chatRouter = require('./routes/chat').default;

app.get('/', (req, res) => {
  res.send('Hello from Anime Social Mini API!');
});

app.get('/test', (req, res) => {
  res.send('Test route works!');
});

// Re-add the proper router usage
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api/chat', chatRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Generic error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err); // Log the entire error object
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
