
import mysql2 from "mysql2";

const pool = mysql2
  .createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "christelUA123",
    database: "zahle_uncovered",
  })
  .promise();

export default pool;
