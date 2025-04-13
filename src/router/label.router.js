const KoaRouter = require('@koa/router')
const {createLabel} = require('../controller/label.controller')
const {verifyAuth} = require('../middleware/login.middlerware.js')

const labelRouter = new KoaRouter({prefix:'/label'})

// 1.创建标签
labelRouter.post('/',verifyAuth,createLabel)
// 2.获取标签列表(作业)
// ...

module.exports = labelRouter