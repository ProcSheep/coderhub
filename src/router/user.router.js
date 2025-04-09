const KoaRouter = require("@koa/router");
const UserController = require("../controller/user.controller.js");
const {verfiUser,handlePassword} = require('../middleware/user.middlerware.js')
// 1.创建路由对象
const userRouter = new KoaRouter({ prefix: "/users" });

// 2.定义路由映射
// 2.1 用户注册接口
// 中间件的流程: 验证用户名和密码是否合规->密码加密->存入数据库
userRouter.post("/", verfiUser , handlePassword , UserController.create);

// 3.导出路由
module.exports = userRouter;
