const { NAME_AND_PASSWORD_IS_REQUIERD, NAME_IS_ALREADY_EXISTS } = require('../config/error.js')
const UserService = require('../service/user.service.js')
const md5Password = require('../utils/md5Password.js')
// 验证用户的中间件
const verfiUser = async (ctx,next) => {
  // 1.验证客户端传递过来的user是否可以保存进数据库
  const {name,password} = ctx.request.body
  // 1.1 验证用户名或密码是否为空
  if(!name || !password){
    // ctx是有app实例的,不需要引入app
    // 触发error监听,并发送错误信息,ctx是为了让错误处理函数可以返回数据(ctx.body)而额外传的参数,错误处理函数是没有ctx参数的
    return ctx.app.emit('error', NAME_AND_PASSWORD_IS_REQUIERD, ctx)
  }
  // 1.2 判断name是否在数据库中已经存在(不允许相同用户名)
  const users = await UserService.findUserByName(name)
  // 如果查到了,返回数组
  if(users.length){
    return ctx.app.emit('error', NAME_IS_ALREADY_EXISTS, ctx)
  }

  // 3.执行下一个中间件
  // 下一个中间件就是handlePassword,需要异步
  await next()
}

// 加密用户密码的中间件
const handlePassword = async(ctx,next) => {
  // 1.取出密码
  const password = ctx.request.body.password
  // 2.加密函数 /utils/md5Password.js
  ctx.request.body.password = md5Password(password)
  // 3.执行下一个中间件 UserController.create,异步
  await next()
}


module.exports = {
  verfiUser,handlePassword
}