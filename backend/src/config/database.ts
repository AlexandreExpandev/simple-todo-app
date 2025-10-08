import sql from 'mssql';

// Azure SQL Connection String
const connectionString = "Server=tcp:expandev-sql-server-br.database.windows.net,1433;Initial Catalog=expandev-main;Persist Security Info=False;User ID=sqladmin;Password=Expandev2024!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

console.log('🔗 Azure SQL Connection Setup');
console.log('  📝 Server: expandev-sql-server-br.database.windows.net');
console.log('  📊 Database: expandev-main');
console.log('  👤 User: sqladmin');

export default connectionString;