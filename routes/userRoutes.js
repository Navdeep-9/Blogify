import express from 'express';
import { aboutapp, checkusername, contact, forgotpassword, getuserforforgotpassword, home, login, loginuser, logout, postcontact, register, registeruser ,reviewapp,submit, updatepassword} from '../controllers/user.js';
import uploadprofile from '../config/multer.js';
import isLoggedIn from '../auth/isloggedin.js';
const router = express.Router();

// get routes

router.get('/',home)

router.get('/login',login)

router.get('/register',register )

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