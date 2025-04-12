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

  // 获取用户动态列表(多条)
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

  // 获取动态详细信息(1条)
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

  // 修改用户动态
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
}

module.exports = new MomentController()