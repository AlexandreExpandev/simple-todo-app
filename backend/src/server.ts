import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRoutes } from './routes/userRoutes';
import { healthRoutes } from './routes/healthRoutes';
import { diagnosticRoutes } from './routes/diagnosticRoutes';
import { DatabaseSetup } from './config/database-setup';

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
        testServers: '/api/v1/diagnostic/test-servers',
        initialize: '/api/v1/diagnostic/initialize (POST)',
        stats: '/api/v1/diagnostic/stats'
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

// Função principal de inicialização
async function startServer() {
  try {
    // Verificar e inicializar banco de dados
    console.log('🔗 Verificando conexão com banco de dados...');
    const isVerified = await DatabaseSetup.verifyDatabase();

    if (!isVerified) {
      console.log('🔧 Banco não inicializado, executando scripts SQL...');
      await DatabaseSetup.initializeDatabase();

      // Verificar novamente após inicialização
      const isNowVerified = await DatabaseSetup.verifyDatabase();
      if (isNowVerified) {
        console.log('✅ Banco inicializado com sucesso!');

        // Mostrar estatísticas
        const stats = await DatabaseSetup.getDatabaseStats();
        console.log('📊 Estatísticas do banco:');
        stats.tables.forEach((table: any) => {
          console.log(`  - ${table.name}: ${table.row_count} registros`);
        });
      } else {
        console.log('⚠️ Falha na verificação após inicialização');
      }
    } else {
      console.log('✅ Banco já inicializado!');

      // Mostrar estatísticas
      try {
        const stats = await DatabaseSetup.getDatabaseStats();
        console.log('📊 Estatísticas do banco:');
        stats.tables.forEach((table: any) => {
          console.log(`  - ${table.name}: ${table.row_count} registros`);
        });
      } catch (error) {
        console.log('⚠️ Não foi possível obter estatísticas do banco');
      }
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`🔍 Diagnostic endpoints: http://localhost:${PORT}/api/v1/diagnostic/`);
    });

  } catch (error: any) {
    console.error('❌ Erro na inicialização:', error.message);
    console.log('⚠️ Servidor iniciando sem verificação de banco...');

    // Iniciar servidor mesmo com erro no banco
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (sem verificação de banco)`);
      console.log(`📝 API Base URL: http://localhost:${PORT}/api/v1`);
    });
  }
}

// Inicializar servidor
startServer();