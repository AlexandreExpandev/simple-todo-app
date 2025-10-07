import sql from 'mssql';

// Connection string direta para o Azure SQL Database
const connectionString = "Server=tcp:expandev-server.database.windows.net,1433;Initial Catalog=expandev-db;Persist Security Info=False;User ID=adminuser;Password=SenhaForte123;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

console.log('🔗 Using hardcoded Azure SQL Connection String');
console.log('  ✅ Server: expandev-server.database.windows.net');
console.log('  ✅ Database: expandev-db');
console.log('  ✅ User: adminuser');

export default connectionString;