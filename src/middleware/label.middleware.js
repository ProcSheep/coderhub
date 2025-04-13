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
  ctx.labels = newLabels
  
  // 4.下一个中间件
  await next()
}

module.exports = verifyLabelExists