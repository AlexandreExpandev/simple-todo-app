import { Router, Request, Response } from 'express';
import sql from 'mssql';
import connectionString from '../config/database';

const router = Router();

// Pool de conexão reutilizável
let pool: sql.ConnectionPool | null = null;

async function getPool(): Promise<sql.ConnectionPool> {
    if (!pool) {
        pool = new sql.ConnectionPool(connectionString);
        await pool.connect();
    }
    return pool;
}

// GET /api/v1/users - Listar todos os usuários
router.get('/', async (req: Request, res: Response) => {
    try {
        const currentPool = await getPool();
        const request = currentPool.request();
        const result = await request.query('SELECT * FROM users ORDER BY id');

        res.json({
            status: 'success',
            users: result.recordset,
            count: result.recordset.length,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/v1/users/:id - Buscar usuário por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid user ID'
            });
        }

        const currentPool = await getPool();
        const request = currentPool.request();
        request.input('userId', sql.Int, userId);
        const result = await request.query('SELECT * FROM users WHERE id = @userId');

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            user: result.recordset[0],
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error fetching user:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/v1/users - Criar novo usuário
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'Name and email are required'
            });
        }

        const currentPool = await getPool();
        const request = currentPool.request();
        request.input('name', sql.NVarChar, name);
        request.input('email', sql.NVarChar, email);

        const result = await request.query(`
            INSERT INTO users (name, email, created_at)
            OUTPUT INSERTED.*
            VALUES (@name, @email, GETDATE())
        `);

        res.status(201).json({
            status: 'success',
            user: result.recordset[0],
            message: 'User created successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export { router as userRoutes };