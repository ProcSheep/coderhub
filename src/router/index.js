const fs = require('fs')

function registerRouters(app){
  // 1.遍历router文件夹内的所有文件
  const files = fs.readdirSync(__dirname)
  // console.log(files)
  for(file of files){
    if(!file.endsWith('.router.js')) continue
    const router = require(`./${file}`)
    app.use(router.routes())
    app.use(router.allowedMethods())
  }
}

module.exports = registerRouters