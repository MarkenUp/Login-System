import sql from "mssql";

const dbConfig = {
  server: "localhost",
  user: "sa",
  password: "innosoft",
  database: "login_db",
  port: 1433,
  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed: ", err));

export { sql, poolPromise };
