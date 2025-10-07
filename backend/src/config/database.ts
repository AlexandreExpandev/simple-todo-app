import sql from 'mssql';

// Possíveis servidores Azure SQL (teste diferentes nomes)
const possibleServers = [
    'expandev-sql-server-br.database.windows.net',
    'expandev-server.database.windows.net',
    'expandev-sql-server.database.windows.net',
    'expandev.database.windows.net'
];

// Connection string correta para o servidor Azure SQL
const connectionString = "Server=tcp:expandev-sql-server-br.database.windows.net,1433;Initial Catalog=expandev-main;Persist Security Info=False;User ID=sqladmin;Password=Expandev2024!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

console.log('🔗 Azure SQL Connection Setup');
console.log('  📝 Server: expandev-sql-server-br.database.windows.net');
console.log('  📊 Database: expandev-main');
console.log('  👤 User: sqladmin');
console.log('  ⚠️  If connection fails, verify server name in Azure Portal:');
console.log('     Azure Portal → SQL databases → expandev-db → Overview → Server name');

export default connectionString;
export { possibleServers };