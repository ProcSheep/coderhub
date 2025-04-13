const KoaRouter = require('@koa/router')
const {verifyAuth} = require('../middleware/login.middlerware.js')
const {create,getMomentList,getMomentDetail,updateMoment,deleteMoment, addLabels} = require('../controller/moment.controller.js')
// const verifyMomentPermission = require('../middleware/permission.middleware.js')
const verifyPermission = require('../middleware/permission.middleware.js')
const verifyLabelExists = require('../middleware/label.middleware.js')


const momentRouter = new KoaRouter({prefix:'/moment'})

// 编写动态接口
// -------1.增: 创建动态----------
// 登录才能创建动态
// 中间件逻辑: 校验登录(检查令牌) -> 发表动态
momentRouter.post('/',verifyAuth,create)
// -------2.查: 查询动态-----------
// 用户获取动态不需要验证用户身份
momentRouter.get('/',getMomentList)
// 获取某一条动态的详情,动态路由
momentRouter.get('/:momentId',getMomentDetail)
// -------3.改: 修改动态-----------
// 修改操作一般是patch(意为'修补,打补丁')
// 只有登录的用户才能修改动态
// 权限认证中间件: 用户只能修改自己的动态
// momentRouter.patch('/:momentId',verifyAuth,verifyMomentPermission ,updateMoment)
// -------4.删: 删除动态-----------
// 同理和更新用户一样,需要验证token和鉴权
// momentRouter.delete('/:momentId',verifyAuth,verifyMomentPermission,deleteMoment)

// 3&4优化鉴权函数后
momentRouter.patch('/:momentId',verifyAuth,verifyPermission ,updateMoment)
momentRouter.delete('/:momentId',verifyAuth,verifyPermission,deleteMoment)

// 5.给动态添加新的标签
momentRouter.post('/:momentId/labels',verifyAuth,verifyPermission,verifyLabelExists,addLabels)

module.exports = momentRouter