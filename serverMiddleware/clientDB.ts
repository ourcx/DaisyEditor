// 创建 MySQL 连接

import mysql from "mysql2";

const connection = mysql.createConnection({
     host: '47.112.109.9',
  user: 'root',
  password: 'Root_123',
  database: 'whiteboard_db',
  waitForConnections: true,
  connectionLimit: 10,
});


export default connection;