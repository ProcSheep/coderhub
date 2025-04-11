// 处理公钥和私钥
const fs = require('fs')
const path = require('path')

// 默认情况下`相对./`与nodemon 启动目录有关,启动目录是src,所以./是从./src起步的
const PRIVATE_KEY = fs.readFileSync("./src/config/keys/private.key")
const PUBLIC_KEY = fs.readFileSync("./src/config/keys/private.key")

// 也可以使用绝对路径
// const private_path = path.resolve(__dirname,'./keys/private.key')
// const pubilc_path = path.resolve(__dirname,'./keys/public.key')
// const PRIVATE_KEY = fs.readFileSync(private_path)
// const PUBLIC_KEY = fs.readFileSync(pubilc_path)

module.exports = {
  PRIVATE_KEY,
  PUBLIC_KEY
}