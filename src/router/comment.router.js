const KoaRouter = require('@koa/router')
const { verifyAuth } = require('../middleware/login.middlerware')
const {createComment,replyComment} = require('../controller/comment.controller')

const commentRouter = new KoaRouter({prefix:'/comment'})

// 增: 新增评论
// 登录才能评论
commentRouter.post('/',verifyAuth,createComment)

// 回复评论
commentRouter.post('/reply',verifyAuth,replyComment)

module.exports = commentRouter