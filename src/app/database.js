const mysql = require("mysql2");

// 1.创建连接池
const connectionPool = mysql.createPool({
  host: "localhost",
  port: 3306,
  database: "coderhub", // 用Navicat直接创建一个数据库即可
  user: "root",
  password: "730035185Lhj.",
  connectionLimit: 10,
});

// 2.获取连接是否成功
connectionPool.getConnection((err, connection) => {
  if (err) {
    console.log("获取连接(connection)失败", err);
    return;
  } else {
    console.log("获取连接(connection)成功!");
  }
  // 2.1 成功获取连接,尝试与数据库建立连接
  // connection参数: 它是从连接池中拿取得一个连接,测试它有没有和数据库连接
  connection.connect((err) => {
    if (err) {
      console.log("和数据库交互失败", err);
      return;
    } else {
      console.log("和数据库交互成功,可以进行操作~");
    }
  });
});

// 3.获取连接池的连接对象
const connection = connectionPool.promise();

module.exports = connection;
