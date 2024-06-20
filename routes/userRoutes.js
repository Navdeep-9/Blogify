import express from 'express';
import usermodel from '../models/user.js';
import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import blogModel from '../models/blog.js';
import { aboutapp, checkusername, contact, forgotpassword, getuserforforgotpassword, home, login, loginuser, logout, postcontact, register, registeruser ,reviewapp,submit, updatepassword} from '../controllers/user.js';
import uploadprofile from '../config/multer.js';
import { allblogs } from '../controllers/blog.js';
import isLoggedIn from '../auth/isloggedin.js';
const KEY = "###%%%&&&"
const router = express.Router();

// get routes

router.get('/',home)

router.get('/login',login)

router.get('/register',register )
router.get('/allblogs',allblogs )

router.get('/contact',contact)
router.get('/logout', logout )
router.get('/about',  aboutapp)
router.get('/review',  reviewapp)



//forgot password

router.get('/forgotpassword',forgotpassword)

router.post('/forgotpassword',getuserforforgotpassword)

router.post('/otpsubmit', submit)

router.post('/updatepassword',isLoggedIn ,updatepassword)



// postroutes
router.post('/register', uploadprofile.single('image'),registeruser)


router.post('/login', loginuser)
router.post('/contact',postcontact)

router.post('/check-username', checkusername)


export default router