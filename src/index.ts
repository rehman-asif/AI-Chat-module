import * as dotenv from 'dotenv';
import { createApp } from './presentation/app';
import { Database } from './infrastructure/database/Database';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    const pool = Database.getInstance();
    await pool.query('SELECT NOW()');
    console.log('Database connection established');

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoint: http://localhost:${PORT}/api/users/:userId/chat`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await Database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await Database.close();
  process.exit(0);
});

startServer();

