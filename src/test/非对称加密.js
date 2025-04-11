// 此文件用于测试,与项目无关
const Koa = require("koa");
const KoaRouter = require("@koa/router");
const jwt = require("jsonwebtoken");
const fs = require('fs')

const app = new Koa();
const userRouter = new KoaRouter({ prefix: "/users" });

// 默认读取的Buffer格式,但是jwt支持这个格式 
const privateKey = fs.readFileSync('./keys/private.key')
const publicKey = fs.readFileSync('./keys/public.key')

// 方便浏览器请求(get)
userRouter.get("/login", (ctx, next) => {
  // 颁发token
  const payload = { id: "007", name: "codewhy" };
  // 私钥颁发
  const token = jwt.sign(payload, privateKey, {
    expiresIn: 6000, // 过期时间(秒)
    algorithm: 'RS256' // RS256是非对称加密,之前用的对称加密是SH256(默认的)
  });
  ctx.body = {
    code: 0,
    token,
    message: "登录成功",
  };
});

userRouter.get("/list", (ctx, next) => {
  // 把token放入header-Auth中
  // 1.获取客户端携带过来的token
  const authorization = ctx.headers.authorization;
  const token = authorization.replace("Bearer ", ""); // 把对应'Bearer '换为空字符串,剩下的密钥
  // 验证token,检查密钥和是否过期
  try {
    // 公钥解析
    const res = jwt.verify(token, publicKey,{
      algorithm: ['RS256'] // 解密可以传递数组,可以用多种方式解密
    });
    ctx.body = {
      code: 0,
      res,
      message: "登录成功",
    };
  } catch (error) {
    ctx.body = {
      code: -1010,
      message: '无效token',
      error
    }
  }
});

app.use(userRouter.routes());
app.use(userRouter.allowedMethods());

app.listen(8100, () => {
  console.log("服务器启动成功,端口号8100");
});
