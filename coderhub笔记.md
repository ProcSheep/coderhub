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