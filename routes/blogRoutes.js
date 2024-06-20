import express from 'express';
import blogModel from '../models/blog.js';
import { addblog, addnewblog, viewblog ,myblogs, myprofile, updateprofile, addcomment, likes, editblog, updateblog, deleteblog, feed, deletecomment,} from '../controllers/blog.js';
import upload from '../config/blog.js';
import uploadprofile from '../config/multer.js';
import { deleteReview, follow,followfollowers,followfollowing,homepage, logout, myfollowers, myfollowing, postnewreview, reviewapp } from '../controllers/user.js';

import isloggedin from '../auth/isloggedin.js'
const blogRouter = express.Router();

blogRouter.get('/homepage',homepage)

blogRouter.get('/addblog',addblog)
blogRouter.get('/logout', logout )
blogRouter.get('/review', reviewapp )
blogRouter.post('/addreview/:id', postnewreview )

blogRouter.get('/viewblog/:id', viewblog)
blogRouter.get('/follow/:id', follow)
// blogRouter.get('/userfollowers/follow/:id', followfollowers)
// blogRouter.get('/userfollowing/follow/:id', followfollowing)
blogRouter.get('/myfollowers/:id', myfollowers)
blogRouter.get('/myfollowing/:id', myfollowing)
blogRouter.get('/myblogs/:id', myblogs)
blogRouter.get('/feed/:id', feed)

blogRouter.get('/deletereview/:id',deleteReview)

blogRouter.get('/myprofile/:id', myprofile)

blogRouter.post('/addblog/:id',upload.single('image'), addnewblog)


blogRouter.post('/updateprofile/:id',uploadprofile.single('image'), updateprofile)

blogRouter.post('/addcomment/:id',addcomment)
blogRouter.get('/deletecomment/:blogid/:commentid', deletecomment)
blogRouter.get('/like/:id', isloggedin ,likes)

blogRouter.get('/editblog/:id',editblog)
blogRouter.get('/deleteblog/:id',deleteblog)

blogRouter.post('/updateblog/:id',upload.single('image'),updateblog)

export default blogRouter