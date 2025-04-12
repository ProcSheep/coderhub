const commentService = require("../service/comment.service")

class CommentController {
  // 创建评论
  async createComment(ctx,next){
    // 1.拿评论内容,动态id以及用户id
    const {content,momentId} = ctx.request.body
    const {id} = ctx.user
    // console.log(content,momentId,id)
    // 2.操作数据库,将数据存入数据库
    const res = await commentService.create(content,momentId,id)
    ctx.body = {
      code: 0,
      message: '发表评论成功!',
      data: res
    }
  }

  // 回复评论
  async replyComment(ctx,next){
    // 1.多拿一份commentId,代表向这条评论回复
    const {content,momentId,commentId} = ctx.request.body
    const {id} = ctx.user
    // console.log(content,momentId,commentId,id)
    const res = await commentService.reply(content,momentId,commentId,id)

    ctx.body = {
      code: 0,
      message: '回复评论成功',
      data:res
    }
  }
}

module.exports = new CommentController()