const { NAME_AND_PASSWORD_IS_REQUIERD, NAME_IS_ALREADY_EXISTS,NAME_IS_NOT_EXISTS,PASSWORD_IS_INCORRENT, UNANTHORIZATION, OPERATION_IS_NOT_ALLOW,DATA_IS_NOT_EXISTS } = require('../config/error.js')
// 集中处理错误
const app = require('../app/index.js')
// 监听error事件
app.on('error',(error,ctx) => {
  let code = 0
  let message = ''

  switch(error){
    case NAME_AND_PASSWORD_IS_REQUIERD:
      code = -1001
      message = '用户名或密码不能为空!'
      break;
    case NAME_IS_ALREADY_EXISTS:
      code = -1002
      message = '用户已存在,请更换用户名!'
      break;
    case NAME_IS_NOT_EXISTS:
      code = -1003
      message = '用户不存在,请检查用户名'
      break;
    case PASSWORD_IS_INCORRENT:
      code = -1004
      message = '密码错误'
      break;
    case UNANTHORIZATION:
      code = -1005
      message = 'token令牌失效或已过期'
      break;
    case OPERATION_IS_NOT_ALLOW:
      code = -1006
      message = '没有操作此资源的权限'
      break;
    case DATA_IS_NOT_EXISTS:
      code = -1007
      message = '数据不存在(可能已被删除)'
      break;
  }

  // 集中错误处理依据switch-case,返回给前端的信息
  ctx.body = { code,message }
})
