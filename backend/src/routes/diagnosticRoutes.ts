import { Router, Request, Response } from 'express';
import sql from 'mssql';
import dbConfig from '../config/database';

const router = Router();

// Pool de conexão reutilizável
let pool: sql.ConnectionPool | null = null;

async function getPool(): Promise<sql.ConnectionPool> {
    if (!pool) {
        pool = new sql.ConnectionPool(dbConfig);
        await pool.connect();
    }
    return pool;
}

// GET /api/v1/diagnostic/database - Teste de conexão com banco
router.get('/database', async (req: Request, res: Response) => {
    try {
        console.log('🔍 Testing database connection...');

        const testPool = new sql.ConnectionPool(dbConfig);
        const connectionStart = Date.now();

        await testPool.connect();
        const connectionTime = Date.now() - connectionStart;

        // Teste básico de query
        const request = testPool.request();
        const queryStart = Date.now();
        const result = await request.query('SELECT 1 as test, GETDATE() as current_time');
        const queryTime = Date.now() - queryStart;

        await testPool.close();

        res.json({
            status: 'connected',
            server: dbConfig.server,
            database: dbConfig.database,
            connection_time_ms: connectionTime,
            query_time_ms: queryTime,
            test_result: result.recordset[0],
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Database connection failed:', error);
        res.status(500).json({
            status: 'failed',
            error: error.message,
            server: dbConfig.server,
            database: dbConfig.database,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/v1/diagnostic/tables - Lista tabelas do banco
router.get('/tables', async (req: Request, res: Response) => {
    try {
        console.log('🔍 Listing database tables...');

        const currentPool = await getPool();
        const request = currentPool.request();

        const result = await request.query(`
            SELECT
                TABLE_NAME as table_name,
                TABLE_TYPE as table_type,
                TABLE_SCHEMA as schema_name
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);

        res.json({
            status: 'success',
            tables: result.recordset,
            count: result.recordset.length,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Failed to list tables:', error);
        res.status(500).json({
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/v1/diagnostic/users - Teste tabela users
router.get('/users', async (req: Request, res: Response) => {
    try {
        console.log('🔍 Testing users table...');

        const currentPool = await getPool();
        const request = currentPool.request();

        // Verificar se tabela existe
        const tableCheck = await request.query(`
            SELECT COUNT(*) as table_exists
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_NAME = 'users'
        `);

        if (tableCheck.recordset[0].table_exists === 0) {
            return res.json({
                status: 'table_not_found',
                message: 'Table users does not exist',
                timestamp: new Date().toISOString()
            });
        }

        // Contar registros
        const countResult = await request.query('SELECT COUNT(*) as user_count FROM users');
        const userCount = countResult.recordset[0].user_count;

        // Pegar alguns registros de exemplo
        const sampleRequest = currentPool.request();
        const sampleResult = await sampleRequest.query('SELECT TOP 5 * FROM users ORDER BY id');

        res.json({
            status: 'success',
            table_exists: true,
            user_count: userCount,
            sample_users: sampleResult.recordset,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Failed to test users table:', error);
        res.status(500).json({
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/v1/diagnostic/scripts - Verificar se scripts SQL foram executados
router.get('/scripts', async (req: Request, res: Response) => {
    try {
        console.log('🔍 Checking if SQL scripts were executed...');

        const currentPool = await getPool();
        const request = currentPool.request();

        const checks = [];

        // Verificar tabelas esperadas
        const expectedTables = ['users', 'projects'];
        for (const tableName of expectedTables) {
            try {
                const result = await request.query(`
                    SELECT COUNT(*) as row_count
                    FROM ${tableName}
                `);
                checks.push({
                    check: `Table ${tableName}`,
                    status: 'exists',
                    row_count: result.recordset[0].row_count
                });
            } catch (error) {
                checks.push({
                    check: `Table ${tableName}`,
                    status: 'missing',
                    error: 'Table does not exist'
                });
            }
        }

        // Verificar índices
        try {
            const indexResult = await request.query(`
                SELECT
                    i.name as index_name,
                    t.name as table_name
                FROM sys.indexes i
                INNER JOIN sys.tables t ON i.object_id = t.object_id
                WHERE i.name IS NOT NULL
                ORDER BY t.name, i.name
            `);

            checks.push({
                check: 'Database indexes',
                status: 'exists',
                index_count: indexResult.recordset.length,
                indexes: indexResult.recordset
            });
        } catch (error) {
            checks.push({
                check: 'Database indexes',
                status: 'failed',
                error: 'Could not check indexes'
            });
        }

        res.json({
            status: 'success',
            script_execution_checks: checks,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Failed to check scripts execution:', error);
        res.status(500).json({
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/v1/diagnostic/environment - Verificar variáveis de ambiente
router.get('/environment', async (req: Request, res: Response) => {
    const envVars = {
        DB_SERVER: process.env.DB_SERVER ? '✅ Set' : '❌ Missing',
        DB_NAME: process.env.DB_NAME ? '✅ Set' : '❌ Missing',
        DB_USER: process.env.DB_USER ? '✅ Set' : '❌ Missing',
        DB_PASSWORD: process.env.DB_PASSWORD ? '✅ Set (hidden)' : '❌ Missing',
        DB_PORT: process.env.DB_PORT || 'Using default (1433)',
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || '3001'
    };

    res.json({
        status: 'success',
        environment_variables: envVars,
        database_config: {
            server: dbConfig.server,
            database: dbConfig.database,
            user: dbConfig.user,
            port: dbConfig.port,
            encrypt: dbConfig.options?.encrypt
        },
        timestamp: new Date().toISOString()
    });
});

export { router as diagnosticRoutes };