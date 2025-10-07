import sql from 'mssql';

// Configuração automática do banco de dados no Azure
// O Azure Web App automaticamente injeta as variáveis de conexão
const dbConfig: sql.config = {
    // Azure Connection String (prioridade máxima)
    connectionString: process.env.AZURE_SQL_CONNECTIONSTRING,

    // Configuração manual como fallback
    server: process.env.AZURE_SQL_SERVER || process.env.DB_SERVER || '',
    database: process.env.AZURE_SQL_DATABASE || process.env.DB_NAME || '',
    user: process.env.AZURE_SQL_USERNAME || process.env.DB_USER || '',
    password: process.env.AZURE_SQL_PASSWORD || process.env.DB_PASSWORD || '',
    port: parseInt(process.env.AZURE_SQL_PORT || process.env.DB_PORT || '1433'),

    options: {
        encrypt: true, // Sempre true para Azure SQL Database
        trustServerCertificate: false, // False para Azure SQL Database
        enableArithAbort: true // Requerido para Azure SQL
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

// Log da configuração (sem mostrar senha)
console.log('🔗 Database connection setup:');
if (dbConfig.connectionString) {
    console.log('  ✅ Using Azure SQL Connection String (automatic)');
} else if (dbConfig.server && dbConfig.database && dbConfig.user && dbConfig.password) {
    console.log('  ✅ Using manual configuration:');
    console.log(`    Server: ${dbConfig.server}`);
    console.log(`    Database: ${dbConfig.database}`);
    console.log(`    User: ${dbConfig.user}`);
    console.log(`    Port: ${dbConfig.port}`);
} else {
    console.log('  ⚠️ No database configuration found');
    console.log('  Available environment variables:');
    console.log(`    AZURE_SQL_CONNECTIONSTRING: ${process.env.AZURE_SQL_CONNECTIONSTRING ? 'Set' : 'Not set'}`);
    console.log(`    AZURE_SQL_SERVER: ${process.env.AZURE_SQL_SERVER ? 'Set' : 'Not set'}`);
    console.log(`    DB_SERVER: ${process.env.DB_SERVER ? 'Set' : 'Not set'}`);
}

export default dbConfig;