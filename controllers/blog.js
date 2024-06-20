import jwt from 'jsonwebtoken'
import blogModel from '../models/blog.js';
import usermodel from '../models/user.js';
import bcrypt from 'bcrypt';
import db from 'mongoose';
import { config } from 'dotenv';
config();
const KEY = process.env.KEY;


import { MongoClient } from "mongodb";
import commentModel from '../models/comments.js';

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);


async function addblog(req, res) {

    let token = req.cookies.token

    let user = jwt.verify(token, KEY)
    if (user) {
        res.status(200).render('blogform', { user })
    }
    else {
        res.status(200).redirect('/login')
    }

}

async function viewblog(req, res) {
    let id = req.params.id

    let user = req.user

    try {
        let blog = await blogModel.findById(req.params.id).populate('user')



        let comments = await commentModel.find({ blogid: id }).populate('userid')

        // console.log(comments);



        if (comments) res.status(200).render('blogcontainer', { blog, user, comments });
    } catch (error) {
        console.error(error)
    }
}

async function addnewblog(req, res) {
    let { title, caption, details, image } = req.body;

    let email = req.user.email

    let user = await usermodel.findOne({ email })


    let blog = await blogModel.create(
        {
            title,
            caption,
            details,
            image: `${req.file.filename}`,
            user: user._id,
            username: req.user.username
        }
    )
    // console.log(blog, user);
    // console.log('here the blog', blog);
    user.blogs.push(blog._id)
    await user.save()
    res.status(200).render('blogcontainer', { blog, user })

}

async function allblogs(req, res) {
    // let blogs = await blogModel.find()
    // res.render('homepage', { blogs })
}


async function myblogs(req, res) {
    let id = req.params.id
    let user = await usermodel.findOne({ _id: id })
    let username = user.username
    let blogs = await blogModel.find({ user: id })
    // console.log(blogs);
    res.status(200).render('myposts', { blogs, user })
}

async function myprofile(req, res) {

    let id = req.params.id

    let user = await usermodel.findOne({ _id: id })

    // console.log(user);

    res.status(200).render('myprofile', { user })

}

async function updateprofile(req, res) {
    let { email, fullname, username, image, password } = req.body

    let id = req.params.id

    let user = await usermodel.findOne({ _id: id })

    try {

        if (fullname) user.fullname = fullname;
        if (username) user.username = username;
        if (req.file) {
            user.image = req.file.filename;
        }
        if (password) {
            bcrypt.genSalt(16, (err, salt) => {
                bcrypt.hash(password, salt, async (err, hash) => {
                    user.password = hash
                    user.save()
                    console.log('password changed');
                })
                console.log('done');
            })
        }

    } catch (error) {
        res.status(200).json({ error: error })
    }
    const payload = {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        username: user.username,
        image: user.image,
    };
    const token = jwt.sign(payload, KEY, { expiresIn: '1h' });
    res.cookie('token', token)
    await user.save()
    console.log('updated user', user);
    res.status(200).redirect('/blog/homepage')
    res.end()
}


async function addcomment(req, res, next) {
    let { detail } = req.body
    let id = req.params.id
    let blog = await blogModel.findOne({ _id: id })
    // console.log(blog);

    let email = req.user.email
    let user = await usermodel.findOne({ email })
    // console.log(user);

    let comment = await commentModel.create({
        details: detail,
        userid: user,
        blogid: blog
    })

    user.comments.push(comment._id)
    await user.save()
    blog.comments.push(comment._id)
    await blog.save()
    // console.log(blog);
    res.status(200).redirect(`/blog/viewblog/${id}`)
    next()
}

// async function deletecomment(req, res) {
//     const commentid = req.params.commentid;
//     const blogid = req.params.blogid;

//     try {
//         const comment = await commentModel.findByIdAndDelete(commentid);

//         if (!comment) {
//             return res.status(404).json({ error: "Comment not found" });
//         }

//         res.status(200).redirect(`/blog/viewblog/${blogid}`);
//     } catch (error) {
//         console.error("Error deleting comment:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// }

async function deletecomment(req, res) {
    const commentid = req.params.commentid;
    const blogid = req.params.blogid;

    try {
        // Delete the comment from the comments collection
        const comment = await commentModel.findByIdAndDelete(commentid);

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Remove the comment ID from the blog's comment array
        await blogModel.findByIdAndUpdate(blogid, {
            $pull: { comments: commentid }
        });

        res.status(200).redirect(`/blog/viewblog/${blogid}`);
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}



async function likes(req, res) {
    let id = req.params.id

    let blog = await blogModel.findOne({ _id: id }).populate('user')
    if (blog.likes.indexOf(req.user.id) === -1) {
        blog.likes.push(req.user.id);
    }
    else {
        blog.likes.splice(blog.likes.indexOf(req.user.id), 1);
    }
    await blog.save();

    res.status(200).redirect('/blog/homepage')



}

async function editblog(req, res) {
    let id = req.params.id

    let blog = await blogModel.findOne({ _id: id })

    res.render('editblog', { blog })
}

async function updateblog(req, res) {
    let id = req.params.id
    let { title, caption, details } = req.body;

    let blog = await blogModel.findOne({ _id: id })

    try {
        if (title) blog.title = title
        if (caption) blog.caption = caption
        if (details) blog.details = details
        if (req.file) blog.image = req.file.filename

    } catch (error) {
        console.log(error);
    }
    await blog.save()
    res.redirect(`/blog/viewblog/${id}`)
}

async function deleteblog(req, res) {
    try {
        let id = req.params.id;

        // Find the blog by ID
        let blog = await blogModel.findOne({ _id: id });
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Delete the blog
        await blogModel.deleteOne({ _id: id });

        // Redirect to homepage after successful deletion
        res.redirect('/blog/homepage');
    } catch (error) {
        console.error("Error deleting blog:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function feed(req,res){
    let id = req.params.id

    let user = await usermodel.findOne({_id:id})

    let userid = await usermodel.find({'followers':id})

    let blogs = await blogModel.find({'user':userid}).populate('user')

    console.log(blogs);

    res.status(200).render('feed', { user, blogs });


}
export { addblog, viewblog, addnewblog, myblogs, allblogs, myprofile, updateprofile, addcomment, likes, editblog, updateblog, deleteblog,feed,deletecomment }