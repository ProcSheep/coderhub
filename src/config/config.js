const dotenv = require('dotenv')
dotenv.config() // 自动加载根目录下的.env文件

// console.log( '获取环境变量',process.env.SERVER_PORT)

// 从process.env中解构出SERVER_PORT然后再暴露出去
module.exports = {
  SERVER_PORT
} = process.env