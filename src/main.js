// 常量引入(.env)
const {SERVER_PORT} = require('./config/config.js')
// 引入错误处理文件
require('./utils/handle.error.js')

// 1.导入app
const app = require('./app/index.js')
// 2.启动app
app.listen(SERVER_PORT,()=>{
  console.log('koa服务器启动成功,端口号',SERVER_PORT)
})