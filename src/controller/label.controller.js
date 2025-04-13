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

module.exports = new LabelController()