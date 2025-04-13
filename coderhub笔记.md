# coderhub
## 易错点ERROR
### 数据库操作try-catch
- 错误来源点`内容管理系统/修改用户动态`
- router的代码
  ```js
    momentRouter.patch('/:momentId',verifyAuth,updateMoment)
  ```
- verifyAuth的代码
  ```js
    // 验证Auth的中间件
    async function  verifyAuth(ctx,next) {
        // 1.获取客户端auth
        const authorization = ctx.headers.authorization
        if(!authorization) return ctx.app.emit('error',UNANTHORIZATION,ctx)
        const token = authorization.replace('Bearer ','')

        // 2.验证token中的信息
        try {
          const res = jwt.verify(token,PUBLIC_KEY,{
            algorithms: ['RS256']
          })
          // 3.把解析的信息存入ctx(下一个中间件使用)
          ctx.user = res
          // 4.传递给下一个中间件
          await next()
        } catch (error) {
          ctx.app.emit('error',UNANTHORIZATION,ctx)
        }
    }
  ```
- updateMoment的代码
  ```js
    async updateMoment(ctx,next){
      // 1.获取修改的内容
      const {content} = ctx.request.body
      // 2.获取要修改的动态的id
      const {momentId} = ctx.params
      // 3.执行数据库操作
      const res = await momentService.updateById(content,momentId)
      // 4.返回数据
      ctx.body = {
        code: 0,
        message: '修改动态成功',
        data: res
      }
    }
  ```
- 查询操作updateById
  ```js
    async updateById(content,id){
      const statement = `UPDATE moment SET content = ? WHERE id = ?;`
      const [result] = await connection.execute(statement,[content,id])
      return result
    }
  ```
- ==**易错点**==
  - 在updateMoment和updateById的代码中,查询数据库操作时没有设置try-catch,所以如果这个操作出现错误,那么就会回到verifyAuth代码中`await next()`,这个代码代表执行下一个中间件,那么当这个中间件出现错误,就会执行verifyAuth内部的try-catch命令,显示你的token过期了,其实根本不是token的问题,只是代码逻辑的问题导致报错爆出的信息误导了你
  - ==解决==: 可以在updateMoment代码中添加新的try-catch语句
  - ==给数据库操作添加try-catch,当出错时可以详细获取出错的位置和出错的原因==
### 删除和修改用户动态测试
- ==apifox对于全局变量token更新不及时或获取出错,所以出现token过期,可以尝试重新复制一遍token==
- 注意: 删除和修改动态的代码肯定是对的,所以如果出现错误,一定是登录校验的问题,经检查,apifox的全局设置token可能并不及时,有时候出现这种情况,先重新登录一次,然后再把删除和修改动态的接口中auth的token重新设置一次,再从终端中打印看看是不是有token
## 项目介绍
- Coderhub只在创建一个程序员分享生活动态的平台; ==旨在练习node高级和mysql的练习demo==
- 完整的项目接口包括:
  - 面向用户的业务接口
  - 面向企业或者内部的后台管理接口
- ==主要完成的功能和涉及知识点:==
  - 1.用户管理系统 (用户登录注册业务)
  - 2.内容动态系统 (mysql一对一)
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
## 用户管理系统
### 创建用户注册接口
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
### 保存用户数据
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
### 用户注册优化
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
### 用户密码存储优化
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
### 登录凭证与http
- 1.登录接口: /login -> name和password -> 验证是否正确 -> 登录成功 -> 返回一个token
- 2.其他接口(用户凭证) -> 请求其他页面 /userinfo或/user/menus等,需要token来验证,同时用户凭证还可以区分权限(普通用户和管理员)
- ==登录凭证的作用==
  - web开发中,使用最多的协议是http协议,http是一个无状态协议.
  - ==无状态http协议举例:==
    - 当你访问一个网站,输入用户名和密码后,成功登录
    - 此时进入网站后,你想继续访问网站其他的数据,这时候又会发送http请求,但是服务器又会要求你登录!
    - ==原因: 每一次http请求都是独立的,上一次的http请求和这一次的http请求没有关系,所以如果不设置用户凭证,那么每次进行新的http都需要登录一次==
    - ==用户凭证的作用就是证明用户登录过==,登录成功之后每次http请求都会携带用户凭证,证明用户登录过而不必每次都登录,http本身是不会记录这个的,你需要自己创建并携带,然后在后端验证这个凭证
- ==用户凭证:==
  - 1.cookie + session
  - 2.==**token令牌(现阶段常用)**==
### 登录凭证-cookie
- ==cookie是什么?==
  - cookie,类型为小型文本文件,==有些网站为了辨别用户身份而存储在用户终端上的数据==
  - ==**特定情况下**,浏览器发送对应的网络请求时,会自动携带cookie,服务器可以取出cookie中的用户信息,验证你的身份==
- cookie总是保存在客户端的,==分为内存cookie和硬盘cookie==
  - 内存cookie: 由浏览器保存,浏览器关闭后,cookie就消失了
  - 硬盘cookie: 保存在硬盘,有一个==过期时间==,当用户手动清理或过期时间到了,才会被清理
- ==**------------浏览器设置cookie--------------**==
  ```js
    <script>
      // js可以设置cookie,工作业务几乎不用js去设置cookie
      // 设置过期时间max-age(秒); 这个cookie是硬盘cookie,过期后清除
      // 而不设置过期时间,默认就是内存cookie,浏览器关闭后会被清除
      document.cookie = "name=codewhy;max-age=30"
      document.cookie = "age=35;max-age=60"
    </script>
  ```
- 1.cookie的常见属性
  - 默认创建的cookie是内存cookie,也称为会话cookie
  - ==max-age==: 设置过期时间 `max-age=60`,想要删除某个cookie,把它设置为0即可
  - expirss: 设置Date.toUtCString(),很少用
- 2.cookie的作用域:
  - cookie在自己的作用域内会被自动携带
  - ==Domain==: 指定哪些主机可以接受cookie
    - 如果不指定,==默认origin,不包含子域名==
        ```
          www.baidu.com 登录成功
          以www.baidu.com开头的都算origin,后面的域名随意,最后都会携带token

          // 子域名 默认不携带cookie
          map.baidu.com
          news.baidu.com
          tieba.baidu.com
        ```
    - 如果指定Domain,则包含子域名 
      ```
          // 服务器方面设置一个子域名
          Domain=mozila.org
      ```
   - path: 指定哪些路径可以接受cookie `path=/docs`
- ==**--------------服务器设置cookie---------------**==
  - koa支持直接操作cookie
  - 在cookie没有过期的情况下,默认同源(origin)下网页跳转会自动携带cookie (users/login->users/list)
    ```js
      // src/test/XXX.js
      // 此文件用于测试,与项目无关
      const Koa = require('koa')
      const KoaRouter = require('@koa/router')

      const app = new Koa()
      const userRouter = new KoaRouter({prefix:'/users'})
      // 方便浏览器请求(get)
      userRouter.get('/login',(ctx,next)=>{
        // 在服务器中,为客户端设置一个内存cookie
        // 参数: cookie名字 值 过期时间
        // 设置过期时间后,变为硬盘cookie
        ctx.cookies.set('slogan','666',{
          maxAge: 5 * 60 * 1000 // ms
        })
        ctx.body = '登录成功'
      })

      userRouter.get('/list',(ctx,next)=>{
        // 验证用户凭证,要求必须携带一个口号666
        const value = ctx.cookies.get('slogan')
        if(value === '666'){
          ctx.body = 'list-登录成功'
        }else{
          ctx.body = '没有cookie,请重新登录'
        }
      })

      app.use(userRouter.routes())
      app.use(userRouter.allowedMethods())

      app.listen(8100,()=>{
        console.log('服务器启动成功,端口号8100')
      })
    ```
    > 流程:
    > 1.服务器设置cookie
    > 2.客户端(浏览器)获取服务器的cookie,并保存
    > 3.在同一个作用域下进行访问(域名/路径),会自动携带cookie
    > 4.服务器可以通过客户端携带的cookie验证用户的身份  
  - ==**2.cookie加密+加盐 (cookie+session)**==
  - 早期的网站验证方式
  - 下载: `npm i koa-session`
    ```js
        // 引入session
        const session = require('koa-session')

        // 配置session参数
        const config = {
          key: 'sessionid',
          signed: true // 需要加盐app.keys
        }
        // 加密: 加盐(双重保险)
        app.keys = ['aaa','bbb','codewhy']
        // app中间件使用
        app.use(session.createSession(config,app))

        // 方便浏览器请求(get)
        userRouter.get('/login',(ctx,next)=>{
          // 加密slogan
          ctx.session.slogan = '666'
          ctx.body = '登录成功'
        })

        userRouter.get('/list',(ctx,next)=>{
          // 会自动解析,把加盐与常规的2个session一起验证
          // 双重保险: 常规session可能会被破解,但是加盐的session很难破解,因为'盐'在源码里面,别人不知道
          const value = ctx.session.slogan
          if(value === '666'){
            ctx.body = 'list-登录成功'
          }else{
            ctx.body = '没有cookie,请重新登录'
          }
        })
    ```
  - ==加密+加盐后的cookie示意图:==
    ![cookie-session](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/cookie-session.5c15vii4wg.png)
### cookie-session的缺点
- ==cookie和session的方式有很多的缺点：==
  - Cookie会被附加在每个HTTP请求中，所以无形中增加了流量（事实上某些请求是不需要的）；
  - Cookie是明文传递的，所以存在安全性的问题；(所以需要session)
  - Cookie的大小限制是4KB，对于复杂的需求来说是不够的；
  - ==**被抛弃的主要原因**==
  - ==对于浏览器外的其他客户端（比如iOS、Android），必须手动的设置cookie和session；==
  - ==对于分布式系统和服务器集群中如何可以保证其他系统也可以正确的解析session==
    - ==分布式系统==: 
    - 举例: ==淘宝双11活动,高并发问题==,同一时刻被很多用户访问,这时服务器很容易崩溃; 
    - 为了解决这个问题,可以设计分布式系统,例如 淘宝的系统可以拆分成许多子系统,比如商品系统,订单系统,评论系统,物流系统,搜索系统
    - 每个子系统保证自己的功能正常即可,分担了总系统的压力,即分流; ==但是每个子系统都需要验证用户的凭证,不同子系统间去验证解析发送的cookie和sessionid是比较麻烦的,涉及加密的算法==
  - ==服务器集群==:
    - 为了解决高并发问题,会部署很多个业务服务器,淘宝的系统由一个代理服务器分配用户的请求,给部署的多个业务服务器分配任务,平衡各个服务器的压力(学习java就必须学习部署服务器集群)
    - 同一个用户的多个订单通过代理服务器分配给不同的业务服务器,这时不同的业务服务器之间如何同步cookie和session,也很麻烦
  - ==**所以，在目前的前后端分离的开发过程中，使用token来进行身份验证的是最多的情况**==
### 认识token+JWT
- ==token==: 可以翻译为令牌；也就是在验证了用户账号和密码正确的情况，给用户颁发一个令牌；这个令牌作为后续用户访问一些接口或者资源的凭证；我们可以根据这个凭证来判断用户是否有权限来访问；
- ==token的使用应该分成两个重要的步骤：==
  - ==生成token==：登录的时候，颁发token；
  - ==验证token==：访问某些资源或者接口时，验证token；
  > ==令牌就是通行证,登录成功后,服务器颁发令牌给你,在token保质期内,访问这个网站的其他资源,出示令牌即可成功访问==
- ==JWT(json web token)生成Token机制==
  - JWT生成的token由三部分组成: 
  - ==1.header==: 
    - alg,加密算法,默认HMAC SHA256(HS256),==对称加密,对用一个密钥进行加密和解密(**不推荐,密钥可能被窃取,导致黑客携带密钥访问各个网站**)==
    - typ: JWT,固定值,通常写为JWT
    - 会通过base64Url算法进行编码
  - ==2.payload==
    - 携带数据,把用户的id和name放入payload
    - 默认携带iat(issued at),即令牌签发时间
    - 过期时间exp(expriation time)
    - 通过base64Url算法进行编码
  - 3.==signature(**防止被破解的关键**)==
    - header和payload可以逆向通过base64Url解码,所以这两部分对于黑客来说就是明文,随意破解
    - ==设置一个secretKey==,将2个结果合并后进行HMACSHA256算法
    - token的组成即为: HMACSHA256(base64Url(header) + base64Url(payload),secretKey);
    - 但是如果secretKey暴露是一个非常危险的事情,这样黑客就可以模拟颁发token,也可以解密token
- ==下载:== `npm i jsonwebtoken`
  ```js
    // /test/XXX.js
    const jwt = require("jsonwebtoken");
    // 密钥信息盐(非常重要)
    const secretKey = "afheifokds";

    // 方便浏览器请求(get)
    userRouter.get("/login", (ctx, next) => {
      // 颁发token
      const payload = { id: "007", name: "codewhy" }; // 携带信息
      const token = jwt.sign(payload, secretKey, {
        expiresIn: 6000, // 过期时间(秒)
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
        const res = jwt.verify(token, secretKey);
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
  ```
- ==把在login颁发的token携带着去访问list页面,然后验证这个token是否合规,是否过期,进而获取到结果==
  ![携带token的apifox测试](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/携带token的apifox测试.83a85b1ckx.png)
- ==同一个secretKey的安全问题==
  - 比如淘宝的分布式系统,每个子系统共享一个相同的secretKey,所有子系统都有颁发密钥的权限,如果一个子系统被黑客攻击,获取到了secretKey,那么别的系统都相当于被攻破,大家共用一个secretkey,就一起完蛋
- ==解决: 非对称加密(RS256)==
  - 非对称加密生成 私钥(private_key)和公钥(public_key)
  - ==私钥具有颁发token的权利,而公钥用于解密私钥token,公钥是没有颁发token的权利的==,所以黑客即使攻击获取了公钥,那也无法颁发token,伪造token,只能解密token
  - 所以私钥存储的服务器就是网络安全保护的重点对象了(java方面的安全加固)
- ==创建私钥和公钥==
  - 新建test下的keys文件夹,用于存储私钥和公钥
  - 在keys文件夹内打开git bush: 
    `openssl genrsa -out private.key 2048`, 创建私钥,输出为private.key文件,字节大小2048(RS256允许最小的字节数)
    `openssl rsa -in private.key -puout -out public.key`, 根据私钥创建公钥,输出为public.key文件
    > ==私钥和公钥是成对的,不可以随意搭配!!!==
- ==服务器设置==
  - 1.设置对应的加密和解密格式RS256
  - 2.读取对应的公钥和私钥fs
  ```js
    // /test/非对称加密.js
    const jwt = require("jsonwebtoken");
    const fs = require('fs')

    // 默认读取的Buffer格式,但是jwt支持这个格式 
    const privateKey = fs.readFileSync('./keys/private.key')
    const publicKey = fs.readFileSync('./keys/public.key')

    // 方便浏览器请求(get)
    userRouter.get("/login", (ctx, next) => {
      // 颁发token
      const payload = { id: "007", name: "codewhy" };
      // 私钥颁发
      const token = jwt.sign(payload, privateKey, {
        expiresIn: '1d', // '1h' '1d', 或者 number秒数
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
  ```
### 非对称加密登录
- 设置登录路由,设置对应中间件
  ```js
    // /router/login.router.js
    // 验证用户中间件
    const {verifyLogin} = require('../middleware/login.middlerware')
    // 颁发令牌中间件,解构实例对象中的函数sign
    const {sign} = require('../controller/login.controller')

    const loginRouter = new KoaRouter({prefix:'/login'})
    // 中间件: verifyLogin负责校验用户名和密码; sign负责加密token令牌
    loginRouter.post('/',verifyLogin,sign)
  ```
  > ==1.登录功能由2个中间件负责,下面一一介绍==
  > 2.记得在app/index.js挂载loginRouter路由,略
- ==**1.登录验证功能verifyLogin**== 
  - ==1.用户名和密码是否为空==
  - ==2.查询数据库中是否存在这个用户,数据库操作记得异步操作==
  - ==3.检查用户信息与数据库是否一致==
- 新增常量(处理错误情况的)
  ```js
    const {
      NAME_AND_PASSWORD_IS_REQUIERD,
      NAME_IS_NOT_EXISTS,
      PASSWORD_IS_INCORRENT,
    } = require("../config/error.js");
  ```
- ==3大功能的代码:==
  ```js
    async function verifyLogin(ctx, next) {
      const { name, password } = ctx.request.body;
      // 1.用户名和密码是否为空
      if (!name || !password) {
        return ctx.app.emit("error", NAME_AND_PASSWORD_IS_REQUIERD, ctx);
      }
      // 2.查询数据库中是否存在这个用户,数据库操作记得异步操作
      const users = await UserService.findUserByName(name);
      /** 如果查到数据,结果返回一个数组,如下
       * "users": [
            {
                "id": 1,
                "name": "codewhy",
                "password": "123456",
                "createAt": "2025-04-09T12:37:40.000Z",
                "updateAt": "2025-04-09T12:37:40.000Z"
            }
          ]
      */
      const user = users[0];
      if (!user) {
        // 如果查不到数据,就是undefined
        return ctx.app.emit("error", NAME_IS_NOT_EXISTS, ctx);
      }
      // 3.检查用户信息与数据库是否一致
      // 到这一步说明,用户名已经正确了,我们获取的数据库用户信息user中,肯定有password的数据
      // 客户端传递过来的密码经过md5加密后与数据库存储的密码进行比对
      if (user.password !== md5password(password)) {
        return ctx.app.emit("error", PASSWORD_IS_INCORRENT, ctx);
      }

      // 4.将这个用户的信息保存进ctx里面,在下一个中间件使用
      ctx.user = user

      // 5.进入下一个中间件,颁发令牌
      await next()
    }

    module.exports = { verifyLogin };
  ```
  > 细节补充: 
  > 1.==数据库操作记得异步(UserService.findUserByName)==
  > 2.对于数据库加密的数据,首先把客户端传的信息用同等方式(md5)加密,然后去比对是否与数据库相等
  > 3.记得next(),执行下一个中间件时,给ctx存储用户信息用于令牌生成,令牌需要payload
  > 4.大写的常量们首先从config/error.js中定义,然后在utils/handle.error.js中处理这些错误情况,略
- ==**2.令牌处理函数sign**==
  - ==1.首先配置公钥与私钥==,在/config/keys文件夹
  - 给公钥和私钥提取出来,在/config/secret.js
    ```js
      // secret.js
      // 处理公钥和私钥
      const fs = require('fs')
      const path = require('path')

      // 默认情况下`相对./`与nodemon 启动目录有关,启动目录是src,所以./是从./src起步的
      const PRIVATE_KEY = fs.readFileSync("./src/config/keys/private.key")
      const PUBLIC_KEY = fs.readFileSync("./src/config/keys/private.key")

      // 也可以使用绝对路径
      // const private_path = path.resolve(__dirname,'./keys/private.key')
      // const pubilc_path = path.resolve(__dirname,'./keys/public.key')
      // const PRIVATE_KEY = fs.readFileSync(private_path)
      // const PUBLIC_KEY = fs.readFileSync(pubilc_path)

      module.exports = {
        PRIVATE_KEY,
        PUBLIC_KEY
      }
    ```
    > ==注意路径的引入方式即可,给了2个解决方案==
  - ==2.配置非对称密钥**sign函数**==
    ```js
      // login.controller.js
      
      const jwt = require('jsonwebtoken')
      const { PRIVATE_KEY } = require('../config/secret')

      class LoginController {
        // 加密token
        async sign(ctx,next){
          // 1.获取用户的信息,已由上一个中间件verifyLogin配置
          const {id,name} = ctx.user

          // 2.颁发令牌token -- 非对称加密
          const payload = {id,name}
          const token = jwt.sign(payload,PRIVATE_KEY,{
            expiresIn: 24 * 60 * 60,
            algorithm: 'RS256'
          })

          // 3.返回信息给前端
          ctx.body = {
            code: 0,
            data:{
              id,
              name,
              token
            },
            message: '登录成功!'
          }
        }
      }

      module.exports = new LoginController()
    ```
- ==测试结果:==
  ![非对称加密登录](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/非对称加密登录.86tu30ufan.png)
### 登录接口的测试
- ==任务: 封装一个测试登录接口路由,同时封装一个鉴定auth的中间件==
- 路由创建测试:
  ```js
    // login.router.js
    // 验证Auth的功能许多接口都会使用,所以封装进middleware中间件
    loginRouter.get('/test',verifyAuth,test)
  ```
- 鉴定auth中间件代码
  ```js
    // login.middleware.js
    // 验证Auth的中间件
    async function  verifyAuth(ctx,next) {
        // 1.获取客户端auth
        const authorization = ctx.headers.authorization
        if(!authorization) return ctx.app.emit('error',UNANTHORIZATION,ctx)
        const token = authorization.replace('Bearer ','')
        // 2.验证token中的信息
        try {
          const res = jwt.verify(token,PUBLIC_KEY,{
            algorithms: ['RS256']
          })
          // 3.把解析的信息存入ctx(下一个中间件使用)
          ctx.user = res
          // 4.传递给下一个中间件
          await next()
        } catch (error) {
          ctx.app.emit('error',UNANTHORIZATION,ctx)
        }
    }
  ```
  > 1.对应的jwt引入和UNANTHORIZATION配置,略
  > 2.解析逻辑和test文件中非对称加密文件一样
- 鉴定auth结束后,test中间件负责返回结果
  ```js
    // login.controller.js
    // 测试登录接口test
    async test(ctx,next){
      ctx.body = {
        code: 0,
        message: '登录成功!',
        info: ctx.user
      }
    }
  ```
- ==apifox中自动化token复制==
  [![pERDCT0.png](https://s21.ax1x.com/2025/04/12/pERDCT0.png)](https://imgse.com/i/pERDCT0)
### 路由注册自动化
- 以前的路由注册:
  ```js 
    // /app/index.js
    // 引入路由
    const userRouter = require('../router/user.router.js')
    const loginRouter = require('../router/login.router.js')

    app.use(userRouter.routes())
    app.use(userRouter.allowedMethods())
    app.use(loginRouter.routes())
    app.use(loginRouter.allowedMethods())
  ```
- 自动化路由文件
  ```js
    // router/index.js
    const fs = require('fs')

    function registerRouters(app){
      // 1.遍历router文件夹内的所有文件
      const files = fs.readdirSync(__dirname)
      // console.log(files)
      for(file of files){
        if(!file.endsWith('.router.js')) continue
        const router = require(`./${file}`)
        app.use(router.routes())
        app.use(router.allowedMethods())
      }
    }

    module.exports = registerRouters
  ```
- 原路由注册文件
  ```js
    // /app/index.js
    const registerRouters = require('../router/index.js')
    registerRouters(app)
  ```
## 内容管理系统
- 内容
  - 用户动态的增删改查
  - sql语句练习
  - 连表查询
  - ==**表的关系:**== 
    - 一对一,一张表 
    - 一对多/多对一,两张表(连表) 
    - 多对多,三张表,外加一张关系表
### 创建用户动态
- 1.创建router-controller-service一套后端逻辑系统
- 2.实现的功能,==发送动态内容(apifox测试==),经验证后,可以存入数据库中
- 已经在navicat中,创建对应的数据库moment
  ```sql
    -- 2.创建moment表(动态评论的表)
    CREATE TABLE IF NOT EXISTS `moment`(
      id INT PRIMARY KEY AUTO_INCREMENT,
      content VARCHAR(1000) NOT NULL, -- 评论
      user_id INT NOT NULL, -- 发布人id
      createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES user(id) -- 发布人id受user表约束(即发布人必须是用户表内存在的用户)
    );
  ```
- ==1.router==
  ```js
    // moment.router.js
    const KoaRouter = require('@koa/router')
    const {verifyAuth} = require('../middleware/login.middlerware.js')
    const {create} = require('../controller/moment.controller.js')

    const momentRouter = new KoaRouter({prefix:'/moment'})

    // 编写动态接口
    // 中间件逻辑: 校验登录(检查令牌) -> 发表动态
    momentRouter.post('/',verifyAuth,create)

    module.exports = momentRouter
  ```
- ==2.controller==
  ```js
    // moment.controller.js

    const momentService = require("../service/moment.service")

    class MomentController {
      // 创建动态
      async create(ctx,next){
        // 1.获取动态内容
        const {content} = ctx.request.body
        // 2.谁发布的动态(寻找登录者的信息)
        // ctx.user的信息来自于上一个中间件verifyAuth
        const {id,name} = ctx.user
        console.log(id,name,content)
        // 3.将动态的数据保存到数据库中
        // 涉及数据库操作,把函数封装进service中
        const res = await momentService.create(content,id)
        ctx.body = {
          code: 0,
          message: '创建用户动态成功',
          data: res
        }

      }
    }

    module.exports = new MomentController()
  ```
- ==3.service==
  ```js
    const connection = require('../app/database')

    class MomentService {
      async create(content,userId){
        const statement = 'INSERT INTO moment (content,user_id) VALUES (?,?);'
        const [result] = await connection.execute(statement,[content,userId])
        return result
      }
    }

    module.exports = new MomentService()
  ```
- ==效果图:==
  [![pERrhqA.png](https://s21.ax1x.com/2025/04/12/pERrhqA.png)](https://imgse.com/i/pERrhqA)
### 查询用户动态数据
- ==准备工作:== 
  - 1.查询数据库中moment的数据(已经在navicat手动添加了许多数据进去了)
  - 2.使用apifox查询,使用`url?offset=0&size=10` 
- 1.获取动态列表的接口router
  ```js
    // 用户获取动态不需要验证用户身份
    const {create,getMomentList} = require('../controller/moment.controller.js')
    momentRouter.get('/',getMomentList)
  ```
- 2.controller,获取offset和size并返回查询结果
  ```js
    const momentService = require("../service/moment.service")
    // 获取用户动态列表
    async getMomentList(ctx,next){
      // 1.从数据库中查动态
      const {offset,size} = ctx.query
      const res = await momentService.queryList(offset,size)
      // 2.返回数据
      ctx.body = {
        code: 0,
        data: res
      }
    }
  ```
- 3.数据库操作service
  ```js
    async queryList(offset=0,size=10){
      // 分页查询
      const statement = `
        SELECT
          m.id id,
          m.content content,
          m.createAt createTime,
          m.updateAt updateTime,
          JSON_OBJECT('id', u.id, 'name', u.NAME, 'createTime', u.createAt, 'updateTime', u.updateAt) AS user
        FROM
          moment m
          LEFT JOIN USER u ON u.id = m.user_id
          LIMIT ? OFFSET ?;
      `
      // offset和size要转化为字符串才可以查询
      const [result] = await connection.execute(statement,[String(size),String(offset)]) 
      return result
    }
  ```
  > ==连表查询的知识回顾==
  > 1.使用左连接查询,通过user表的id和moment表的user_id(外键)连接
  > 2.创建新的对象user,放入查询的user表数据,其中包括用户的'id,名字,用户创建日期和用户更新日期'
### 查询用户动态详情
- ==和查询用户动态列表代码几乎一样==,只是这一次是根据momentId去具体查询某一条动态的信息
- ==区别:== 
  - 1.查询条件由query变为params,momentId作为动态路由的一部分,使用apifox查询`url/1`(/:momentId占位符)
  - 2.查询sql语句条件变化,删除`offset,size...`,添加`WHERE u.id = ?`,即查询符合条件的id
- 1.router
  ```js
    // 获取某一条动态的详情,动态路由
    momentRouter.get('/:momentId',getMomentDetail)
  ```
- 2.controller.js
  ```js
  async getMomentDetail(ctx,next){
      // 1.获取动态id(动态id存入路由中,使用params获取)
      const {momentId} = ctx.params
      // 2.根据id查询动态详情
      const res = await momentService.queryById(momentId)
      // 2.返回数据
      ctx.body = {
        code: 0,
        data: res[0] // 只有一条数据
      }
    }
  ```
- 3.service.js
  ```js
    async queryById(id){
      const statement = `
        SELECT
          m.id id,
          m.content content,
          m.createAt createTime,
          m.updateAt updateTime,
          JSON_OBJECT('id', u.id, 'name', u.NAME, 'createTime', u.createAt, 'updateTime', u.updateAt) AS user
        FROM
          moment m
          LEFT JOIN USER u ON u.id = m.user_id
          WHERE m.id = ?;
      `
      const [result] = await connection.execute(statement,[id])
      return result
    }
  ```
### 修改用户动态
- apifox测试,参数为: 动态的id(params) + body-json(修改的内容content)
- router
  ```js
    // -------3.改: 修改动态-----------
    // 修改操作一般是patch(意为'修补,打补丁')
    // 只有登录的用户才能修改动态
    momentRouter.patch('/:momentId',verifyAuth,updateMoment)
  ```
- controller
  ```js
    async updateMoment(ctx,next){
      // 1.获取修改的内容
      const {content} = ctx.request.body
      // 2.获取要修改的动态的id
      const {momentId} = ctx.params
      // 3.执行数据库操作
      const res = await momentService.updateById(content,momentId)
      // 4.返回数据
      ctx.body = {
        code: 0,
        message: '修改动态成功',
        data: res
      }
    }
  ```
- service
  ```js
    async updateById(content,id){
      const statement = `UPDATE moment SET content = ? WHERE id = ?;`
      const [result] = await connection.execute(statement,[content,id])
      return result
    }
  ```
### 修改用户动态优化
- ==优化点: 用户只能修改自己的动态,需要一个验证权限的中间件==
- ==测试用户为2号用户==,登录的用户名和密码如下
  ```
    {
      "name":"jame",
      "password":"666999"
    }
  ```
- 此用户修改动态时只能修改自己创建过的动态,对别的用户的动态无权修改,如下
  ![修改动态权限的演示](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/修改动态权限的演示.2h8ht0633n.png)
  > 1.即jame用户可以修改momentId为8的数据,但是不可以修改momentId为11的数据 
  > 2.momentId还是`url/:momentId`的方式传递
  > ==3.注意在后面的删除用户动态章节测试中,我已经把8号数据给删除了,所以记得看着数据库重新测试,数据库是变化的==
- router 新增鉴权中间件verifyMomentPermission
  ```js
    momentRouter.get('/:momentId',getMomentDetail)
    // -------3.改: 修改动态-----------
    // 修改操作一般是patch(意为'修补,打补丁')
    // 只有登录的用户才能修改动态
    // 权限认证中间件: 用户只能修改自己的动态
    momentRouter.patch('/:momentId',verifyAuth,verifyMomentPermission ,updateMoment)
  ```
- verifyMomentPermission代码 ==(/middleware)==
  ```js
    const {checkMomentPermission} = require('../service/permission.service')
    const {OPERATION_IS_NOT_ALLOW} = require('../config/error')

    async function  verifyMomentPermission(ctx,next) {
      // 1.获取登录用户的id和要修改动态的momentId
      const {momentId} = ctx.params // 这是你要修改的动态id
      const {id} = ctx.user // 此信息来自于上一个中间件verifyAuth,可以获取到用户的id信息
      // 2.查询user的id是否由修改momentId动态的权限
      const isPermission = await checkMomentPermission(momentId,id)
      if(!isPermission){ // 无权限
        return ctx.app.emit('error',OPERATION_IS_NOT_ALLOW,ctx)
      }
      // 有权限,执行下一个中间件,更改用户的动态
      await next()
    }

    module.exports = verifyMomentPermission
  ```
  > 1.错误配置OPERATION_IS_NOT_ALLOW略
  > 2.记得操作数据库用异步
- 操作数据库service
  ```js
    // permission.service.js
    const connection = require('../app/database')

    class PermissionService {
      async checkMomentPermission(momentId,user_id){
        // 当momentId(id)和用户user_id都满足条件时,会查询到数据,这就是有权限
        const statement = 'SELECT * FROM moment WHERE id = ? AND user_id = ?'
        const [result] = await connection.execute(statement,[momentId,user_id])
        return !!result.length // 转为布尔,0为false,其余为true
      }
    }

    module.exports = new PermissionService()
  ```
  > 双!可以快速把数字转为布尔值
### 删除用户动态
- ==和修改用户动态一样,复用一下鉴权的中间件们(verifyAuth,verifyMomentPermission)==
  ```js
    // -------4.删: 删除动态-----------
    // 同理和更新用户一样,需要验证token和鉴权
    momentRouter.delete('/:momentId',verifyAuth,verifyMomentPermission,deleteMoment)
  ```
- deleteMoment (/controller)
  ```js
    // 删除用户动态(1条)
    async deleteMoment(ctx,next){
      // 1.获取要删除动态的id
      const {momentId} = ctx.params
      // 2.数据库操作
      const res = await momentService.deleteById(momentId)
      // 3.返回数据
      ctx.body = {
        code: 0,
        message: '删除动态成功',
        data: res
      }
    }
  ```
- service
  ```js
    async deleteById(id){
      const statement = `DELETE FROM moment WHERE id = ?;`
      const [result] = await connection.execute(statement,[id])
      return result
    }
  ```
### 优化封装鉴权函数
- 功能: 
  - ==1.优化鉴权函数,更加灵活(**对于格式有更严格的要求**)==
  - ==2.自己新增检验数据是否存在的函数(isDataExists)==
- 优化鉴权代码
  ```js
    // permission.middleware.js
    // 灵活的鉴权组件
    async function  verifyPermission(ctx,next) {
      // 1.获取用户的id
      const {id} = ctx.user
      // 2.灵活化,根据params中的momentId信息,判断这是类型数据的鉴权
      // 这样以后不仅是动态(mount),其他比如评论(comment)等功能,都可以复用
      // 动态的前提是: /:momentId 起名字格式为 /:表名字Id (/:commentId)
      // ctx.params => { momentId : 4 }
      const keyName = Object.keys(ctx.params)[0] // momentId
      const resourceId = ctx.params[keyName] // 4
      const resourceName = keyName.replace('Id','') // moment
      // console.log(keyName,resourceName,resourceId)

      // 可以先查询下这个资源是否存在(如果被删除了,就不要进行操作了)
      const isDataExists = await checkExists(resourceName,resourceId)
      if(!isDataExists){ // 数据不存在
        return ctx.app.emit('error', DATA_IS_NOT_EXISTS,ctx)
      }
      // 鉴权
      const isPermission = await checkPermission(resourceName,resourceId,id)
      if(!isPermission){ // 无权限
        return ctx.app.emit('error',OPERATION_IS_NOT_ALLOW,ctx)
      }
      // 有权限,执行下一个中间件,更改用户的动态
      await next()
    }
  ```
  > 看注释即可,学会如何拆分信息; 同时注意以后占位符路由的格式
- 鉴定权限的代码(数据库操作)
  ```js
    // permission.service.js
    class PermissionService {
      // 鉴定有没有权限
      async checkPermission(resourceName,resourceId,user_id){
        const statement = `SELECT * FROM ${resourceName} WHERE id = ? AND user_id = ?;`
        const [result] = await connection.execute(statement,[resourceId,user_id])
        return !!result.length
      }

      // 鉴定有没有数据
      async checkExists(resourceName,resourceId){
        const statement = `SELECT * FROM ${resourceName} WHERE id = ?;`
        const [result] = await connection.execute(statement,[resourceId])
        return !!result.length // 转为布尔,0为false,其余为true
      }
    }
  ```
  > 1.鉴定权限和之前的逻辑一样,把sql语句动态化了,传入的所有参数都是动态化的(resourceName,resourceId,user_id)
  > 2.鉴定有没有数据是我自己加的函数,代码正确,主要从表中根据id查询是否有这个数据,如果没有数据,就不必进一步操作了,直接返回相关信息即可
### 创建评论接口
- 创建动态路由的sql语句
  ```sql
    -- 3.创建评论表
    CREATE TABLE IF NOT EXISTS `comment`(
      id INT PRIMARY KEY AUTO_INCREMENT,
      content VARCHAR(1000) NOT NULL, -- 评论内容
      moment_id INT NOT NULL, -- 给哪一条动态评论
      user_id INT NOT NULL, -- 谁评论的
      comment_id INT DEFAULT NULL, -- 是否在回复另一条评论(可选)
      createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY(moment_id) REFERENCES moment(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY(comment_id) REFERENCES comment(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  ```
- router-controller-service一条龙
  ```js
    // router
    const commentRouter = new KoaRouter({prefix:'/comment'})

    // 增: 新增评论
    // 登录才能评论
    commentRouter.post('/',verifyAuth,createComment)
  ```
  ```js
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
    }
  ```
  ```js
    class CommentService {
      async create(content,momentId,userid){
        const statement = 'INSERT INTO comment (content,moment_id,user_id) VALUES (?,?,?);'
        const [result] = await connection.execute(statement,[content,momentId,userid])
        return result
      }
    }
  ```
- ==apifox传参:==
  - 1.测试需要auth
  - 2.参数 body-json
      ```json
        {
          "content": "你好,我是新人",
          "momentId": 2
        }
      ```
  > ==本次评论是给动态回复的==(momentId:2),动他的id标注为2,因为是给动态回复的,所以没有参数commentId(给那一条评论回复的)
### 回复评论接口
- 同理创建新的接口
- router
  ```js
    // 回复评论
    commentRouter.post('/reply',verifyAuth,replyComment)
  ```
- controller
  ```js
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
        data: res
      }
    }
  ```
- service
  ```js
    async reply(content,momentId,commentId,userid){
      const statement = 'INSERT INTO comment (content,moment_id,comment_id,user_id) VALUES (?,?,?,?);'
      const [result] = await connection.execute(statement,[content,momentId,commentId,userid])
      return result
    }
  ```
- ==apifox传参:==
  - 1.测试需要auth
  - 2.参数 body-json
      ```json
        {
          "content": "我也是新人,哈哈哈哈",
          "momentId": 2,
          "commentId": 1
        }
      ```
  
  > ==此接口架构和测试几乎与创建评论接口一致,只是多传递一个参数(commentId)==
  > ==原因==: 此次回复,是针对评论的,所以要书写明白是给那一条评论回复的(commentId),并且两个评论都是在同一个动态下面的动态,所以他们的momentId相同
- ==示意图==
  ![回复评论](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/回复评论.4g4ojjnn37.png)
### 展示动态和评论的关系
- ==主要修改对应的sql语句,**新知识sql的子查询**==
- 1.查询动态列表
  - 展示动态信息
  - ==展示每个动态评论的个数==
    ```sql
    SELECT
      m.id id,
      m.content content,
      m.createAt createTime,
      m.updateAt updateTime,
      JSON_OBJECT('id', u.id, 'name', u.NAME, 'createTime', u.createAt, 'updateTime', u.updateAt) AS user,
      -- 子查询select的结果别名为commentCount,合并进查询数据
      -- 当评论表(comment)中的动态id(moment_id)等于动态表的id时(m.id),则表示此评论属于此动态,对它们进行计数,聚合函数COUNT(*)
      (SELECT COUNT(*) FROM comment WHERE comment.moment_id = m.id) AS commentCount
    FROM
      moment m
      LEFT JOIN user u ON u.id = m.user_id
      LIMIT ? OFFSET ?;
    ```
- 2.查询动态详细信息(==比较难==)
  - 展示动态信息
  - ==展示评论的详细信息和创建此评论的用户信息==
    ```sql
    SELECT
      m.id id,
      m.content content,
      m.createAt createTime,
      m.updateAt updateTime,
      JSON_OBJECT('id', u.id, 'name', u.NAME, 'createTime', u.createAt, 'updateTime', u.updateAt) AS user,
      -- 内置评论对象内容,每个评论的详细内容和发布者的信息user
      -- 内置评论对象comments,内容为数组(内聚函数JSON_ARRAYAGG,依照评论的动态id(c.moment_id)分组,然后每个item是对象格式JSON_OBJECT)
      (
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',c.id,'content',c.content,'commentId',c.comment_id,
          -- user发布评论者的信息
          'user',JSON_OBJECT('id',cu.id,'name',cu.name)
        ))
      ) AS comments
    FROM
      moment m
      LEFT JOIN user u ON u.id = m.user_id
      -- 2个左连接 动态表moment LEFT JOIN 评论表comment/用户表user
      LEFT JOIN comment c ON c.moment_id = m.id
      LEFT JOIN user cu ON cu.id = c.user_id
      WHERE m.id = ?
      -- 分组
      GROUP BY m.id;
    ```
- 查询结果示意图:
  ![动态详情与评论详情](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/动态详情与评论详情.92qblljsi2.png)

### 标签接口开发
- 1.sql创建标签表
  ```sql
    -- 5.创建标签表
    CREATE TABLE IF NOT EXISTS `label`(
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(10) NOT NULL UNIQUE, -- 标签名字(不能为空,唯一的)
      createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  ```
  > 已经加入标签: 篮球 rap 跳舞
- 2.公式化创建标签接口
  ```js
    const {createLabel} = require('../controller/label.controller')

    const labelRouter = new KoaRouter({prefix:'/label'})
    labelRouter.post('/',verifyAuth,createLabel)
  ```
  ```js
    const labelService = require("../service/label.service")

    class LabelController {
      async createLabel(ctx,next){
        const {name} = ctx.request.body
        const res = await labelService.create(name)
        ctx.body = {
          code: 0,
          message: '创建标签成功',
          res
        }
      }
    }
  ```
  ```js
    class LabelService {
      async create(name){
        const statement = 'INSERT INTO label (name) VALUES (?);'
        const [result] = await connection.execute(statement,[name])
        return result
      }
    }
  ```
### 标签与动态接口开发
- ==**主要讲多对多的关系**,一个动态可以有多个标签(篮球,rap,跳舞),一个标签可以对应多个动态(篮球-> 坤坤/爱坤/kunkun/你干嘛哎呦)==
- 多对多关系: 
  - 学生和课程(sql笔记学过)/动态和标签
  - ==对于'多对多'关系的处理方式都一样,建立关系表==
- 前端功能
  - 创建的动态时,可以选择已经给出的标签,也可以自定义新的标签
  - 接口格式: `/moment/:momentId/labels`
  - 传递label数据: `['篮球','rap','跳舞','搞笑','运动','体育']`
- 后端中间件:
  - 1.验证登录
  - 2.验证是否有修改动态的权限
  - 3.验证标签数据是否存在于label表中
    - 如果存在,直接使用
    - 如果不存在,先将新标签加入label表
    - 最终,所有的标签已经存在于label表中,这时创建动态-标签关系数据,加入'动态-标签'的关系表中去
- router ==多个中间件,之前的可以复用==
  ```js
    // 5.给动态添加新的标签
    momentRouter.post('/:momentId/labels',verifyAuth,verifyPermission,verifyLabelExists,addLabels)
  ```
- ==verifyLabelExists==
- 客户端传递来的数据`['篮球','rap','跳舞','搞笑','运动','体育']`,去校验它们有没有在label表中
- 存在就继续,不存在就添加,同时都把它们的id记录到ctx中,为下一个中间件插入moment_id--label_id提供标签id的数据
  ```js
    // label.middleware.js
    const labelService = require("../service/label.service")

    const verifyLabelExists = async (ctx,next) => {
      // 1.获取客户端传递过来的所有labels
      const {labels} = ctx.request.body

      // 2.判断所有的labels是否存在于label表中
      const newLabels = []
      for(const name of labels){
        const result = await labelService.queryLabelByName(name)
        const labelObj = { name } // ES6
        if(result){ // 查到数据,说明标签在label表中,获取对应标签的id
          labelObj.id = result.id // => {name: "篮球",id: 1}
        }else{ // 添加新的标签进入label表,同时获取新加入标签的id
          const insertResult = await labelService.create(name)
          // 打印可知,创建成功后,会有insertId属性返回,代表新标签的id值 
          labelObj.id = insertResult.insertId // => {name: "体育",id:4}
        }
        newLabels.push(labelObj)
      }
      // 3.把所有的标签加入数组中,形成类似[{name: "篮球",id: 1},{name: "体育",id:4}]的结构
      // console.log(newLabels)
      ctx.labels = newLabels // 给下一个中间件的数据
      
      // 4.下一个中间件
      await next()
    }

    module.exports = verifyLabelExists
  ```
- 使用到的数据库service代码 ==queryLabelByName==
- 简单查询label表中是否有这个标签数据(name)
  ```js
      // label.service.js
     // 2.根据标签名字查询label表中是否有这个数据
    async queryLabelByName(name){
      const statement = 'SELECT * FROM label WHERE name = ?;'
      const [result] = await connection.execute(statement,[name])
      return result[0]
    }
  ```
- 处理下一个中间件addLabels
  ```js
    // moment.controller.js
    // 为moment添加标签
    async addLabels(ctx,next){
      // 1.获取动态和标签参数,为'动态-标签'关系表打基础
      const {labels} = ctx // labels总结的参数,上一个中间件总结 newLabels
      const {momentId} = ctx.params 
      // 2.moment_id和label_id添加到moment_label关系表中
      try {
        for(const label of labels){
          // 2.1 判断关系表中是否存在label_id---moment_id的数据,防止重复给相同的动态添加已经加过的标签
          const isExists = await momentService.hasLabel(momentId,label.id)
          if(!isExists){
            // 2.2 不存在moment_id---label_id关系,就添加这个关系进入关系表
            const res = await momentService.addLabel(momentId,label.id)
            // console.log(res)
          }
        }
        ctx.body = {
          code: 0,
          message: '为动态添加标签成功'
        }
      } catch (error) {
        ctx.body = {
          code: -3001,
          message: '为动态添加标签失败,请检测数据是否有误',
          error
        }
      }    
    }
  ```
  > ==所有的数据库操作其实都可以添加try-catch,这样可以更加细致获取到哪一个数据库操作代码出了问题==
- 2个momentService的函数
  ```js
      // 查询关系表是否存在此momentId,labelId的关系数据
      async hasLabel(momentId,labelId){
        const statement = 'SELECT * FROM moment_label WHERE moment_id = ? AND label_id = ?;'
        const [result] = await connection.execute(statement, [momentId,labelId]);
        return !!result.length
      }

      // 给关系表添加新的关系数据
      async addLabel(momentId,labelId){
        const statement = 'INSERT INTO moment_label (moment_id,label_id) VALUES (?,?);'
        const [result] = await connection.execute(statement, [momentId,labelId]);
        return result
      }
  ```
- 关系表添加结束后
  ![动态与标签的关系表](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/动态与标签的关系表.58hk2n1ukr.png)
### 新增动态的标签个数
- 在原有的查询动态列表的service中,新增sql语句
  ```sql
    SELECT
      m.id id,
      m.content content,
      m.createAt createTime,
      m.updateAt updateTime,
      JSON_OBJECT('id', u.id, 'name', u.NAME, 'createTime', u.createAt, 'updateTime', u.updateAt) AS user,
      (SELECT COUNT(*) FROM comment WHERE comment.moment_id = m.id) AS commentCount,
    + (SELECT COUNT(*) FROM moment_label ml WHERE ml.moment_id = m.id) AS labelCount
    FROM
      moment m
      LEFT JOIN user u ON u.id = m.user_id
      LIMIT ? OFFSET ?;
  ```
  > 把新增的1行sql语句复制到moment.service.js中的queryList函数中去
### 查询动态详情+标签数组
- ==联合sql语句很难,不理解可以查2次,然后用js拼接一下==
- ==1.两条sql语句方法==
- 原有的查询动态详情的sql语句不变,新增一个只查询动态标签的sql语句
  ```sql
     SELECT
        m.id id, -- 为了测试具象化保留的,可以没有,只保留label即可
        m.content content,
        (
          JSON_ARRAYAGG(JSON_OBJECT(
            'id', l.id , 'name',l.name -- label数据
          ))
        ) AS labels
      FROM
        moment m
        LEFT JOIN moment_label ml ON ml.moment_id = m.id
        LEFT JOIN label l ON ml.label_id = l.id
      WHERE m.id = 12 -- 测试用的 (记得换为?)
      -- 分组
      GROUP BY m.id;
  ```
  > 把查询数据中的label数据截取出来,然后拼接到原有的查询动态详情的结构后面即可,所有的sql操作后查询的结果,在node后端中都是json数据,所以通过js代码即可轻松拼接,最后返回
- ==2.一条sql语句解决,使用子查询==
  ```sql
    -- 4.2 查询动态详情数据,同时显示评论详情+labels
    -- 再使用左连接时不对的,因为连续的左连接,前面的左连接会影响到后面的左连接
    -- 方法 1
    -- 解决: 子查询,谁复杂把谁放进子查询(查评论V/查标签)
    -- 把查询评论和查询标签的LEFT JOIN用子查询分开了
      SELECT
        m.id id,
        m.content content,
        m.createAt createTime,
        m.updateAt updateTime,
        JSON_OBJECT('id', u.id, 'name', u.NAME, 'createTime', u.createAt, 'updateTime', u.updateAt) AS user,
        -- 查询评论详情进入子查询
        (
          SELECT
            JSON_ARRAYAGG(JSON_OBJECT(
              'id',c.id,'content',c.content,'commentId',c.comment_id,
              'user',JSON_OBJECT('id',cu.id,'name',cu.name)
            ))
          FROM comment c
          LEFT JOIN user cu ON c.user_id = cu.id
          WHERE c.moment_id = m.id
        ) AS comments,
        (
          JSON_ARRAYAGG(JSON_OBJECT(
            'id', l.id , 'name',l.name
          ))
        ) AS labels
      FROM
        moment m
        LEFT JOIN user u ON u.id = m.user_id
        LEFT JOIN moment_label ml ON ml.moment_id = m.id
        LEFT JOIN label l ON ml.label_id = l.id
      WHERE m.id = 12 -- 测试用的 (记得换为?)
      -- 分组
      GROUP BY m.id;
  ```
- 查询的结果
  ![动态+评论+标签联合sql查询](https://github.com/ProcSheep/picx-images-hosting/raw/master/学习笔记/动态+评论+标签联合sql查询.102csv6y9m.png)
