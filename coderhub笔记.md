# coderhub
## 项目介绍
- Coderhub只在创建一个程序员分享生活动态的平台; ==旨在练习node高级和mysql的练习demo==
- 完整的项目接口包括:
  - 面向用户的业务接口
  - 面向企业或者内部的后台管理接口
- ==主要完成的功能和涉及知识点:==
  - 1.用户管理系统 (用户登录注册业务)
  - 2.内容管理系统 (mysql一对一)
  - 3.内容评论系统 (mysql一对多)
  - 4.内容标签管理 (mysql多对多)
  - 5.文件管理系统 (文件上传)
  - 其他的待开发(相似的)......
## 项目搭建
- 1.`npm init -y` 创建package.json等文件
- 2.配置热启动命令,创建业务代码文件 `src/main.js`
    package.json
    ```json
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "start": "nodemon ./src/main.js"
      },
    ```
    > 启动命令为`npm run start`
- 3.==node后端框架为koa框架==
- 下载对应的koa第三方库
  ```
    npm i koa @koa/router koa-bodyparser
  ```
- 4.抽取变量方法(==以端口号为例子==)
- 4.1 在项目的根目录文件新建.env文件,内部为端口号常量信息
  ```
    SERVER_PORT=8000
  ```
- 4.2 下载第三方库dotenv用于获取env环境变量 `npm i dotenv`
- 4.3 src下创建config/config.js用于配置
  ```js
    // config.js
    const dotenv = require('dotenv')
    dotenv.config() // 自动加载根目录下的.env文件

    // console.log( '获取环境变量',process.env.SERVER_PORT)

    // 从process.env中解构出SERVER_PORT然后再暴露出去
    module.exports = {
      SERVER_PORT
    } = process.env
  ```
- 4.4 main.js引入端口号,并初始化
  ```js
    // config.js
    const {SERVER_PORT} = require('./config/config.js')
    const Koa = require('koa')
    const app = new Koa()

    app.listen(SERVER_PORT,()=>{
      console.log('koa服务器启动成功,端口号',SERVER_PORT)
    })
  ```
  > ==之后统一修改变量就在.env文件中修改即可==
- 5.抽取路由
- 5.1 创建路由文件src/router/user.router.js
  ```js
    const KoaRouter = require('@koa/router')
    // 1.创建路由对象
    const userRouter = new KoaRouter({ prefix: '/users'})

    // 2.定义路由映射
    userRouter.get('/list',(ctx,next)=>{
      ctx.body = 'user list'
    })

    // 3.导出路由
    module.exports = userRouter
  ```
  > 抽取用户路由userRouter,其他的路由同理
- 5.2 引入路由进入main.js,并挂载(下面一起写)
- 6.抽取main.js中的app
- 6.1 创建src/app/index.js
  ```js
    // 引入koa和它的第三方工具
    const Koa = require('koa')
    const bodyParser = require('koa-bodyparser')
    // 引入路由
    const userRouter = require('../router/user.router.js')

    // 1.创建app
    const app = new Koa()

    // 2.对app使用中间件
    app.use(bodyParser())
    app.use(userRouter.routes())
    app.use(userRouter.allowedMethods())

    // 3.导出app
    module.exports = app
  ```
  > 处理所有app的代码
- 6.2 最终简洁的main.js
  ```js
    const {SERVER_PORT} = require('./config/config.js')

    // 1.导入app
    const app = require('./app/index.js')
    // 2.启动app
    app.listen(SERVER_PORT,()=>{
      console.log('koa服务器启动成功,端口号',SERVER_PORT)
    })
  ```
- ==总结==
  - 1.配置常量.env
  - 2.抽取路由router
  - 3.抽取app
  
## 创建用户注册接口
- ==操作数据库,下载`npm i mysql2`==
- ==后端接口设计准则:==
  - router: 接口url和methods设计
  - controller: 中间件函数
  - service: 操作数据库
  - database: 连接数据库,配置数据库 (==/app/database.js文件,统一配置共用==)
  > ==分散代码,方便维护== 
- 以用户类接口为例子
- ==user.router.js==
  ```js
    const KoaRouter = require("@koa/router");
    const UserController = require("../controller/user.controller.js");
    // 1.创建路由对象
    const userRouter = new KoaRouter({ prefix: "/users" });

    // 2.定义路由映射
    // 2.1 用户注册接口
    userRouter.post("/", UserController.create);

    // 3.导出路由
    module.exports = userRouter;
  ```
- ==user.controller.js==
  ```js
    const UserService = require("../service/user.service.js");

    class UserController {
      create(ctx, next) {
        // 1.获取用户传递的信息
        const user = ctx.request.body;
        // 2.操作数据库
        UserService.create(user);
        // 3.查看存储结果,告知前端存储是否成功
        ctx.body = "用户注册成功!";
      }
    }

    module.exports = new UserController();
  ```
- ==user.service.js==
  ```js
    const connection = require('../app/database.js')

    class UserService {
      create(user) {
        console.log("已经把user保存进数据库中了",user);
      }
    }

    module.exports = new UserService();
  ```
- ==app/database.js==
  ```js
    const mysql = require("mysql2");

    // 1.创建连接池
    const connectionPool = mysql.createPool({
      host: "localhost",
      port: 3306,
      database: "coderhub", // 用Navicat直接创建一个数据库即可
      user: "root",
      password: "730035185Lhj.",
      connectionLimit: 10,
    });

    // 2.获取连接是否成功
    connectionPool.getConnection((err, connection) => {
      if (err) {
        console.log("获取连接(connection)失败", err);
        return;
      } else {
        console.log("获取连接(connection)成功!");
      }
      // 2.1 成功获取连接,尝试与数据库建立连接
      // connection参数: 它是从连接池中拿取得一个连接,测试它有没有和数据库连接
      connection.connect((err) => {
        if (err) {
          console.log("和数据库交互失败", err);
          return;
        } else {
          console.log("和数据库交互成功,可以进行操作~");
        }
      });
    });

    // 3.获取连接池的连接对象
    const connection = connectionPool.promise();

    module.exports = connection;
  ```
## 保存用户数据
- ==测试方法==: 使用apifox调试出post请求,根据对应的路由地址,发送body-json数据(用户的name和password)
  ![apifox示意图](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/apifox示意图.58hjx1uj9u.png)
- ==apifox整理全局变量baseURL(`http://localhost:8000`),之后使用变量`{{baseURL}}`代替==
  >
- ==user.controller.js==
  - 负责把数据传递给service文件,然后异步等待结果,返回给前端
    ```js
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
    ```
- ==user.service.js==
  - 负责接受controller的数据,然后使用预编译语句把数据存入数据库
    ```js
      class UserService {
        async create(user) {
          // 执行sql语句,把用户的数据(user)保存进入数据库
          const {name,password} = user
          const statement = 'INSERT INTO `user` (name,password) VALUES (?,?);'
          // 操作数据库是异步的,解构出关键信息
          const [result] = await connection.execute(statement,[name,password])
          return result 
        }
      }
    ```
## 用户注册优化
- ==处理用户注册失败的情况:==
  - 验证用户名或密码是否为空
  - 判断name是否在数据库中已经存在(不允许相同用户名)
- user.controller.js
  ```js
     async create(ctx, next) {
        // 1.获取用户传递的信息
        const user = ctx.request.body;
        // 2.验证客户端传递过来的user是否可以保存进数据库
        const {name,password} = user
        // 2.1 验证用户名或密码是否为空
        if(!name || !password){
          ctx.body = {
            code: -1001,
            message: '用户名或密码不能为空!'
          }
          return 
        }
        // 2.2 判断name是否在数据库中已经存在(不允许相同用户名)
        const users = await userService.findUserByName(name)
        // 如果查到了,会返回数组
        if(users.length){ // 代表数据库中有这个用户
          ctx.body = {
            code: -1002,
            message: '用户已经存在,请修改用户名!'
          }
          return 
        }
      }
  ```
- ==查询数据库中是否有用户重名,需要service(操作数据库的文件)解决,新增查询name的函数==
- user.service.js
  ```js
    // 查询user表中的name数据
    async findUserByName(name){
      const statement = 'SELECT * FROM `user` WHERE NAME = ?;'
      // 返回值有[values,field],只需要values
      const [values] = await connection.execute(statement,[name])
      return values 
    }
  ```
>
- ==**2.进一步的优化**==
  - ==**1.抽取controller内部的代码**==
  - ==**2.集中的错误处理函数**==
  - ==**3.常量错误信息的抽取**==
  >
  - ==1.controller内的注册处理代码被抽取到router.js中的中间件verifyUser里面==
    ```js
      // user.router.js
      const verfiUser = require('../middleware/user.middlerware.js')
      userRouter.post("/", verfiUser , UserController.create);
    ```
  - ==2.新建中间价文件夹middleware/user.middleware.js==
    ```js
      // 常量抽取 
      const { NAME_AND_PASSWORD_IS_REQUIERD, NAME_IS_ALREADY_EXISTS } = require('../config/error.js')
      const UserService = require('../service/user.service.js')
      // 验证用户的中间件
      const verfiUser = async (ctx,next) => {
        // 1.验证客户端传递过来的user是否可以保存进数据库
        const {name,password} = ctx.request.body
        // 1.1 验证用户名或密码是否为空
        if(!name || !password){
          // ctx是有app实例的,不需要引入app
          // 触发error监听,并发送错误信息,ctx是为了让错误处理函数可以返回数据(ctx.body)而额外传的参数,错误处理函数是没有ctx参数的
          return ctx.app.emit('error', NAME_AND_PASSWORD_IS_REQUIERD, ctx)
        }
        // 1.2 判断name是否在数据库中已经存在(不允许相同用户名)
        const users = await UserService.findUserByName(name)
        // 如果查到了,返回数组
        if(users.length){
          return ctx.app.emit('error', NAME_IS_ALREADY_EXISTS, ctx)
        }

        // 3.执行下一个中间件
        // 下一个中间件就是UserController.create,本身需要异步
        await next()
      }

      module.exports = verfiUser
    ```
    > 解析: 
    > 1.集中错误处理文件已经监听error事件了,所以抽取代码中,对于错误的处理emit发送错误信息
    > 2.错误的信息已用常量代替(全大写)  
    > 3.下一个中间件需要异步,所以记得给next()加await
  - ==3.集中错误处理文件 /utils/handle.error.js==
    ```js
      const { NAME_AND_PASSWORD_IS_REQUIERD, NAME_IS_ALREADY_EXISTS } = require('../config/error.js')
      // 集中处理错误
      const app = require('../app/index.js')
      // 监听error事件
      app.on('error',(error,ctx) => {
        let code = 0
        let message = ''

        switch(error){
          case NAME_AND_PASSWORD_IS_REQUIERD:
            code = -1001
            message = '用户名或密码不能为空!'
            break;
          case NAME_IS_ALREADY_EXISTS:
            code = -1002
            message = '用户已存在,请更换用户名!'
            break;
        }

        // 集中错误处理依据switch-case,返回给前端的信息
        ctx.body = { code,message }
      })
    ```
  - ==4.错误常量的定义文件 /config/error.js==
    ```js
      const NAME_AND_PASSWORD_IS_REQUIERD = 'name and password is required'
      const NAME_IS_ALREADY_EXISTS = 'name is already exists'

      module.exports = {
        NAME_AND_PASSWORD_IS_REQUIERD,
        NAME_IS_ALREADY_EXISTS
      }
    ```
## 用户密码存储优化
- ==优化用户密码存储==: 之前存储到数据库的用户密码都是明文形式,这样很不安全,数据库被盗用后,密码会被泄漏,==所以密码这种信息需要加密,**常用md5加密算法**==
 ![数据库密码加密(md5)](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/数据库密码加密(md5).3uv0t0jh8y.png)
- 新的注册中间件流程: user.router.js
  ```js
    // 中间件的流程: 验证用户名和密码是否合规->密码加密->存入数据库
    userRouter.post("/", verfiUser , handlePassword , UserController.create);
  ```
- 加密中间件 user.middleware.js
  ```js
    // 加密用户密码的中间件
    const handlePassword = async(ctx,next) => {
      // 1.取出密码
      const password = ctx.request.body.password
      // 2.加密密码 /utils/md5Password.js
      ctx.request.body.password = md5Password(password)
      // 3.执行下一个中间件 UserController.create,异步
      await next()
    }
  ```
- 加密函数 utils/md5Password.js
  ```js
    // 使用md5加密密码(不可逆的)
    // 需要第三方库,node内置的库
    const crypto = require('crypto')
    function md5Password(password){
      // 创建md5的hash加密算法
      const md5 = crypto.createHash('md5')
      // 把加密的结果转为十六进制
      return md5.update(password).digest('hex')
    }

    module.exports = md5Password
  ```
  > 注意: 发现规律了,userRouter的三个中间件都是异步的,这是因为最后一个中间件UserController.create涉及到数据库的插入等操作,所以他一定是异步的,这样上一个中间件执行next的时候也需要异步`await next()`,最终一连串都是异步,别的router中的中间件不免要操作数据库,而且操作数据库的中间件一般是最后一个中间件(前面的中间件是处理特殊情况的),==所以习惯上路由的所有的中间件统统async/await + await next()即可==