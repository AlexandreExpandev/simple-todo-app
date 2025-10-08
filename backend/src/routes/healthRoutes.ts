import { Router } from 'express';
import sql from 'mssql';
import connectionString from '../config/database';

const router = Router();

router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    database: {
      status: 'unknown',
      message: 'Not tested'
    }
  };

  // Teste rápido de conexão com banco
  try {
    const testPool = new sql.ConnectionPool(connectionString);
    await testPool.connect();
    await testPool.request().query('SELECT 1');
    await testPool.close();

    health.database = {
      status: 'connected',
      message: 'Database connection successful'
    };
  } catch (error: any) {
    health.database = {
      status: 'disconnected',
      message: error.message
    };
  }

  res.json(health);
});

export { router as healthRoutes };