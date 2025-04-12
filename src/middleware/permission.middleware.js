const {checkMomentPermission,checkPermission,checkExists} = require('../service/permission.service')
const {OPERATION_IS_NOT_ALLOW, DATA_IS_NOT_EXISTS} = require('../config/error')

// 原来的鉴权组件,只针对moment
// async function  verifyMomentPermission(ctx,next) {
//   // 1.获取登录用户的id和要修改动态的momentId
//   const {momentId} = ctx.params
//   const {id} = ctx.user
//   // 2.查询user的id是否由修改momentId动态的权限
//   const isPermission = await checkMomentPermission(momentId,id)
//   if(!isPermission){ // 无权限
//     return ctx.app.emit('error',OPERATION_IS_NOT_ALLOW,ctx)
//   }
//   // 有权限,执行下一个中间件,更改用户的动态
//   await next()
// }

// 灵活的鉴权组件
async function  verifyPermission(ctx,next) {
  // 1.获取用户的id
  const {id} = ctx.user
  // 2.灵活化,根据params中的momentId信息,判断这是类型数据的鉴权
  // 这样以后不仅是动态(mount),其他的比如评论(XXXId),发言等功能,都可以复用
  // 动态的前提是: /:momentId 起名字格式为 /:表名字Id
  // ctx.params => { momentId : 4 }
  const keyName = Object.keys(ctx.params)[0] // momentId
  const resourceId = ctx.params[keyName] // 4
  const resourceName = keyName.replace('Id','') // moment
  // console.log(keyName,resourceName,resourceId)

  // 可以先查询下这个资源是否存在(如果被删除了,就不要进行操作了)
  const isDataExists = await checkExists(resourceName,resourceId)
  if(!isDataExists){ // 数据不存在
    return ctx.app.emit('error', DATA_IS_NOT_EXISTS,ctx)
  }
  // 鉴权
  const isPermission = await checkPermission(resourceName,resourceId,id)
  if(!isPermission){ // 无权限
    return ctx.app.emit('error',OPERATION_IS_NOT_ALLOW,ctx)
  }
  // 有权限,执行下一个中间件,更改用户的动态
  await next()
}

// module.exports = verifyMomentPermission
module.exports = verifyPermission