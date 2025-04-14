const fileService = require("../service/file.service")
const userService = require("../service/user.service")
const {SERVER_PORT,SERVER_HOST} = require('../config/config')

class FileController {
  async create(ctx,next){
      // console.log(ctx.request.file)
      // 1.获取信息
      const {filename,mimetype,size} = ctx.request.file
      const {id} = ctx.user
      // 2.将图片和id结合起来存储
      const res = await fileService.create(filename,mimetype,size,id)
      // 3.把头像地址信息存入user表
      const avatarUrl = `${SERVER_HOST}:${SERVER_PORT}/users/avatar/${id}`
      // console.log(avatarUrl)
      const res2 = await userService.updateUserAvatar(avatarUrl,id)
      // 4.返回结果
      ctx.body = {
        code: 0,
        message: "文件上传成功",
        avatar: avatarUrl
      }
  }
}

module.exports = new FileController()