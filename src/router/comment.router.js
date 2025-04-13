const KoaRouter = require('@koa/router')
const { verifyAuth } = require('../middleware/login.middlerware')
const {createComment,replyComment} = require('../controller/comment.controller')

const commentRouter = new KoaRouter({prefix:'/comment'})

// 增: 新增评论
// 登录才能评论
commentRouter.post('/',verifyAuth,createComment)

// 回复评论
commentRouter.post('/reply',verifyAuth,replyComment)
// 删除,查看评论功能 ---> 作业, 和之前的动态内容一样
// 没有修改评论功能,写过的评论无法更改


module.exports = commentRouter