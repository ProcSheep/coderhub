const {UPLOAD_PATH} = require("../config/path.js");
const userService = require("../service/user.service.js");
const fs = require('fs')

class UserController {
  async create(ctx, next) {
    // 1.获取用户传递的信息
    const user = ctx.request.body;
    // 2.操作数据库(等待异步操作完数据库后返回的结果res)
    const res  = await userService.create(user);
    // 3.查看存储结果,告知前端存储是否成功
    ctx.body = {
      message: '用户创建成功!',
      data: res
    }
  }

  async showAvatarImage(ctx,next){
    const {userId} = ctx.params
    // console.log(userId)
    const avatarInfo = await userService.queryAvatarByUserId(userId)
    // console.log(avatarInfo)
    // 浏览器显示文件
    const {filename,mimetype} = avatarInfo
    ctx.type = mimetype // 设置类型,浏览器根据文件类型才能正常显示图片
    ctx.body = fs.createReadStream(`${UPLOAD_PATH}/${filename}`)
  }
}

module.exports = new UserController();
