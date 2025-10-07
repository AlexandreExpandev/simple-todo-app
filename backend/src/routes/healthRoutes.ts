import { Router } from 'express';
import sql from 'mssql';
import dbConfig from '../config/database';

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

  // Teste rápido de conexão com banco (opcional)
  try {
    const testPool = new sql.ConnectionPool(dbConfig);
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
    // Não falhar o health check por causa do banco
    // health.status = 'degraded';
  }

  res.json(health);
});

export { router as healthRoutes };