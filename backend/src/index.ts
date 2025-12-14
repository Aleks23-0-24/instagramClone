import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
// also accept URL-encoded bodies for form submissions/uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

// Handle payload too large errors explicitly
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err.type === 'entity.too.large') {
    console.error('Payload too large:', err);
    return res.status(413).json({ error: 'Payload too large' });
  }
  console.error('Unhandled error:', err); // Log the entire error object
  res.status(500).send('Something broke!');
});
