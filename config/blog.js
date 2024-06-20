import multer from "multer";
import crypto from 'crypto'
import {extname} from 'path'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/blogs')
    },
    filename: function (req, file, cb) {
    crypto.randomBytes(12,(err,filename)=>{
        const fn = filename.toString('hex') + extname(file.originalname)
        cb(null, fn)
    });

    }
  })

const upload = multer({ storage: storage })

export default upload