const UserService = require("../service/user.service.js");

class UserController {
  async create(ctx, next) {
    // 1.获取用户传递的信息
    const user = ctx.request.body;
    // 2.操作数据库(等待异步操作完数据库后返回的结果res)
    const res  = await UserService.create(user);
    // 3.查看存储结果,告知前端存储是否成功
    ctx.body = {
      message: '用户创建成功!',
      data: res
    }
  }
}

module.exports = new UserController();
