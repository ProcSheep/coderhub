const multer = require('@koa/multer')
const {UPLOAD_PATH} = require('../config/path')

const upload = multer({
  storage: multer.diskStorage({
    destination(req,file,cb){
      // 相对路径受全局启动配置的路径影响,所以相对路径是以/src为基准的
      cb(null,UPLOAD_PATH)
    },
    filename(req,file,cb){
      cb(null,Date.now() + "_" + file.originalname)
    }
  })
})

const hanldAvatar = upload.single('avatar')
module.exports = hanldAvatar