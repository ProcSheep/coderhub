// 此文件用于测试,与项目无关
const Koa = require('koa')
const KoaRouter = require('@koa/router')
// 引入session
const session = require('koa-session')

const app = new Koa()
const userRouter = new KoaRouter({prefix:'/users'})
// 配置session参数
const config = {
  key: 'sessionid',
  maxAge: 60 * 1000 * 5,
  signed: true // 需要加盐
}
// 加密: 加盐(双重保险)
app.keys = ['aaa','bbb','codewhy']
// app中间件使用
app.use(session.createSession(config,app))

// 方便浏览器请求(get)
userRouter.get('/login',(ctx,next)=>{
  // 在服务器中,为客户端设置一个内存cookie
  // 参数: cookie名字 值 过期时间
  // 设置过期时间后,变为硬盘cookie
  // ctx.cookies.set('slogan','666',{
  //   maxAge: 5 * 60 * 1000 // ms
  // }) 

  // 加密slogan
  ctx.session.slogan = '666'
  ctx.body = '登录成功'
})

userRouter.get('/list',(ctx,next)=>{
  // 验证用户凭证,要求必须携带一个口号666
  // const value = ctx.cookies.get('slogan')

  // 会自动解析,把加盐与常规的2个session一起验证
  // 双重保险: 常规session可能会被破解,但是加盐的session很难破解,因为'盐'在源码里面,别人不知道
  const value = ctx.session.slogan
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