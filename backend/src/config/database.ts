import sql from 'mssql';

// Configuração do banco de dados
const dbConfig: sql.config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'demo_project',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: true, // Para Azure SQL Database
        trustServerCertificate: false // Para Azure SQL Database
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

export default dbConfig;