import sql from 'mssql';
import * as fs from 'fs';
import * as path from 'path';
import connectionString from './database';

export class DatabaseSetup {
    private static async getPool(): Promise<sql.ConnectionPool> {
        const pool = new sql.ConnectionPool(connectionString);
        await pool.connect();
        return pool;
    }

    /**
     * Verifica se o banco de dados está inicializado (se tem tabelas)
     */
    static async verifyDatabase(): Promise<boolean> {
        try {
            console.log('🔍 Verificando se banco está inicializado...');

            const pool = await this.getPool();
            const request = pool.request();

            // Verificar se existe pelo menos a tabela users
            const result = await request.query(`
                SELECT COUNT(*) as table_count
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_NAME = 'users'
            `);

            await pool.close();

            const tableExists = result.recordset[0].table_count > 0;
            console.log(`📊 Tabela 'users' ${tableExists ? 'existe' : 'não existe'}`);

            return tableExists;
        } catch (error: any) {
            console.error('❌ Erro ao verificar banco:', error.message);
            return false;
        }
    }

    /**
     * Executa os scripts SQL em ordem
     */
    static async initializeDatabase(): Promise<void> {
        try {
            console.log('🔧 Inicializando banco de dados...');

            const pool = await this.getPool();
            const scriptsPath = path.join(__dirname, '../../database');

            // Verificar se pasta de scripts existe
            if (!fs.existsSync(scriptsPath)) {
                console.log('⚠️ Pasta database não encontrada, criando banco vazio');
                await pool.close();
                return;
            }

            // Listar e ordenar scripts
            const files = fs.readdirSync(scriptsPath)
                .filter(file => file.endsWith('.sql'))
                .sort(); // Ordenação natural: 01_, 02_, 03_, etc.

            console.log(`📂 Encontrados ${files.length} scripts SQL:`, files);

            // Executar cada script
            for (const file of files) {
                const filePath = path.join(scriptsPath, file);
                const sqlContent = fs.readFileSync(filePath, 'utf-8');

                // Dividir por statements (separados por GO ou ponto e vírgula no final de linha)
                const statements = sqlContent
                    .split(/\bGO\b/gi)
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0);

                console.log(`⚡ Executando: ${file} (${statements.length} statements)`);

                for (let i = 0; i < statements.length; i++) {
                    const statement = statements[i].trim();
                    if (statement) {
                        try {
                            const request = pool.request();
                            await request.query(statement);
                            console.log(`  ✅ Statement ${i + 1}/${statements.length} executado`);
                        } catch (error: any) {
                            // Se for erro de "objeto já existe", continuar
                            if (error.message.includes('already exists') ||
                                error.message.includes('já existe') ||
                                error.message.includes('Cannot insert duplicate key')) {
                                console.log(`  ⚠️ Statement ${i + 1}/${statements.length} - objeto já existe, continuando...`);
                            } else {
                                console.error(`  ❌ Erro no statement ${i + 1}/${statements.length}:`, error.message);
                                // Continuar com próximo statement mesmo com erro
                            }
                        }
                    }
                }
            }

            await pool.close();
            console.log('✅ Inicialização do banco concluída!');

        } catch (error: any) {
            console.error('❌ Erro na inicialização do banco:', error.message);
            throw error;
        }
    }

    /**
     * Verifica quantos registros tem em cada tabela
     */
    static async getDatabaseStats(): Promise<any> {
        try {
            const pool = await this.getPool();
            const request = pool.request();

            // Listar todas as tabelas
            const tablesResult = await request.query(`
                SELECT TABLE_NAME as table_name
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_NAME
            `);

            const stats: any = {
                tables: [],
                total_tables: tablesResult.recordset.length
            };

            // Contar registros em cada tabela
            for (const table of tablesResult.recordset) {
                const tableName = table.table_name;
                try {
                    const countRequest = pool.request();
                    const countResult = await countRequest.query(`SELECT COUNT(*) as count FROM [${tableName}]`);

                    stats.tables.push({
                        name: tableName,
                        row_count: countResult.recordset[0].count
                    });
                } catch (error) {
                    stats.tables.push({
                        name: tableName,
                        row_count: 'Error',
                        error: 'Could not count rows'
                    });
                }
            }

            await pool.close();
            return stats;

        } catch (error: any) {
            console.error('❌ Erro ao obter estatísticas:', error.message);
            throw error;
        }
    }
}