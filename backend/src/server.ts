import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRoutes } from './routes/userRoutes';
import { healthRoutes } from './routes/healthRoutes';
import { diagnosticRoutes } from './routes/diagnosticRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/diagnostic', diagnosticRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Demo Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      users: '/api/v1/users',
      diagnostic: {
        database: '/api/v1/diagnostic/database',
        tables: '/api/v1/diagnostic/tables',
        users: '/api/v1/diagnostic/users',
        scripts: '/api/v1/diagnostic/scripts',
        environment: '/api/v1/diagnostic/environment',
        testServers: '/api/v1/diagnostic/test-servers'
      }
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Base URL: http://localhost:${PORT}/api/v1`);
});