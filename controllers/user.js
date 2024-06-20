import express from 'express';
import usermodel from '../models/user.js';
import blogModel from '../models/blog.js';
import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import transport from './email.js';
import contectModel from '../models/contact.js';
import reviewModel from '../models/reviews.js';
import { config } from 'dotenv';
config();

const KEY = process.env.KEY;

const router = express.Router();


async function home(req, res) {
    try {
        let token = req.cookies.token
        if (token) {
            const user = jwt.verify(token, KEY);
            let blogs = await blogModel.find({}).populate('user')

            res.render('loginform', { blogs, user })
        } else {
            let blogs = await blogModel.find({}).populate('user')
            // console.log(blogs);
            res.render('loginform', { blogs, })
        }
    } catch (error) {
    }
}
async function homepage(req, res) {

    let blogs = await blogModel.find({}).populate('user')
    // console.log(blogs);

    const token = req.cookies.token
    if (!token) {
        res.status(200).render('homepage', { blogs })
    }
    else {
        try {
            const user = jwt.verify(token, KEY);
            // console.log(user);
            res.status(200).render('homepage', { user, blogs })

        } catch (error) {
            res.status(200).render('homepage', { blogs })
        }
    }
}

function login(req, res) {
    res.status(200).redirect('#login')
}

function register(req, res) {
    res.status(200).render('register')
}


async function logout(req, res) {
    let blogs = await blogModel.find({})
    res.cookie('token', "");
    res.status(200).redirect('/')
}

function aboutapp(req,res){
    res.render('about')
}

async function reviewapp(req,res){

    let reviews = await reviewModel.find({}).populate('userid')

    let user = req.user
    if (user) {
        res.render('review',{reviews,user})
    }
    else{
        res.render('review',{reviews})
    }
}
async function postnewreview(req,res){

    
    let{details} = req.body

    let reviews = await reviewModel.find({}).populate('userid')

    let user = req.user
    
    let review = await reviewModel.create({
        details,
        userid:user.id,
    })

    await review.save();
    res.redirect('/blog/review')
}

async function deleteReview(req, res) {
    try {
        const reviewId = req.params.id;
        await reviewModel.findByIdAndDelete(reviewId);
        res.status(200).redirect('/blog/review');
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


function contact(req, res) {
    res.status(200).render('contact')
}

async function registeruser(req, res, next) {
    let { fullname, email, username, password, role, image } = req.body;
    let blogs = await blogModel.find({})

    let user = await usermodel.findOne({ email })
    let userOname = await usermodel.findOne({ username })
    if (user || userOname) {
        return res.status(400).json({ message: "User already exist with this email Or username" });
    }
    else {
        bcrypt.genSalt(16, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                let user = await usermodel.create(
                    {
                        fullname,
                        username,
                        email,
                        password: hash,
                        image: `${req.file.filename}`,
                        role

                    })
                let payload = ({ email, username, fullname, image: `${req.file.filename}`, id: user.id })
                const token = jwt.sign(payload, KEY)
                res.cookie('token', token)

                req.user = user
                res.status(200).redirect('/blog/homepage')
            })
        })
    }
}


async function checkusername(req, res) {
    const { username } = req.body;

    try {
        const user = await usermodel.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(200).json({ message: 'Username available' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

async function loginuser(req, res, next) {
    let { email, password } = req.body;
    let blogs = await blogModel.find({})

    let user = await usermodel.findOne({ email })
    if (!user) return res.status(400).json({ message: "Register Yourself" });
    else {
        // console.log(user);
        try {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    let payload = ({ email, username: user.username, fullname: user.fullname, image: user.image, id: user._id })
                    const token = jwt.sign(payload, KEY)
                    res.cookie('token', token)
                    res.status(200).redirect('/blog/homepage')
                }
                else {
                    return res.status(400).json({ message: "Something went Wrong P" });
                }
            })
        } catch (error) {

            return res.status(400).json({ message: error });
        }
    }
}
function forgotpassword(req, res) {
    res.status(200).render('forgotpassword')
}

async function getuserforforgotpassword(req, res) {
    let email = req.body.email
    console.log(email);
    let randomNumber = Math.floor(Math.random() * 1000000);

    console.log(randomNumber);

    let user = await usermodel.findOne({ email });

    console.log(user);


    if (!user) return res.status(404).send('User not found')
    else {
        // console.log(user.OTP);
        if (randomNumber) {
            user.OTP = randomNumber;
            await user.save();
            console.log(user);
        }

        // assign jwt randomNumber
        let payload = ({ email })
        const token = jwt.sign(payload, KEY)
        res.cookie('token', token)

    }

    async function sendmail() {
        const info = await transport.sendMail({
            from: {
                name: 'navdeep',
                address: 'navdeepsingh.stealth@gmail.com'
            },
            to: ['ns22d6862@gmail.com'],
            subject: 'OTP',
            text: `Your OTP is`,
            html: `<h1> you otp is ${randomNumber}</h1>`

        })
        console.log('email sent');
    }

    sendmail()

    res.status(200).render('otp');


}

async function submit(req, res) {
    let { OTP, email } = req.body;

    let user = await usermodel.findOne({ email })

    if (!user) return res.status(400).json({ message: "Something went Wrong" });

    let otp = user.OTP

    if (OTP == otp) {
        res.status(200).render('reset-password', { user })
    }

    else {
        return res.status(400).json({ message: "OTP validation failed" });
    }
}

async function updatepassword(req, res) {
    const { email, password } = req.body;

    let user = await usermodel.findOne({ email })


    if (password) {

        bcrypt.genSalt(16, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {

                user.password = hash
                user.save()
                console.log(user);
            })

            // res.status(200).redirect('/')

            res.cookie("token", "")
            res.redirect('/blog/homepage')
        })
    }
}

async function postcontact(req, res) {
    let { name, email, mobile, message } = req.body;

    let contact = await contectModel.create({
        name,
        email,
        mobile,
        message,
    })

    res.status(200).send('thanks for visiting us we will contact you soon')

}

// async function follow(req, res) {
//     let id = req.params.id

//     let blog = await blogModel.findOne({ _id: id })

//     let userid = blog.user._id

//     let currentuser = await usermodel.findOne({_id:req.user.id})

//     let user = await usermodel.findOne({ _id: userid }).populate('followers')
//     if (user.followers.indexOf(req.user.id) === -1) {
//         user.followers.push(req.user.id);
//         currentuser.following.push(user.id)
//     }
//     else {
//         user.followers.splice(user.followers.indexOf(currentuser.id), 1);
//         currentuser.following.splice(req.user.following.indexOf(user.id), 1);
//     }
//     await user.save();
//     await currentuser.save();
//     console.log(user);
//     console.log(currentuser);

//     res.status(200).redirect('/blog/homepage')


// }

async function follow(req, res) {
    try {
        const userId = req.params.id;

        // Find the user to follow/unfollow
        const user = await usermodel.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the current user
        const currentUser = await usermodel.findOne({ _id: req.user.id });
        if (!currentUser) {
            return res.status(404).json({ error: "Current user not found" });
        }

        // Toggle follow/unfollow for the user
        const followerIndex = user.followers.indexOf(req.user.id);
        if (followerIndex !== -1) {
            // If already following, remove the current user from followers
            user.followers.splice(followerIndex, 1);
        } else {
            // If not following, add the current user to followers
            user.followers.push(req.user.id);
        }
        await user.save();

        // Toggle follow/unfollow for the current user
        const followingIndex = currentUser.following.indexOf(user._id);
        if (followingIndex !== -1) {
            // If already following, remove the user from following
            currentUser.following.splice(followingIndex, 1);
        } else {
            // If not following, add the user to following
            currentUser.following.push(user._id);
        }
        await currentUser.save();

        res.status(200).redirect('/blog/homepage');

    } catch (error) {
        console.error("Error following/unfollowing user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function followfollowers(req, res) {
    try {
        const userId = req.params.id;

        // Find the user to follow/unfollow
        const user = await usermodel.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the current user
        const currentUser = await usermodel.findOne({ _id: req.user.id });
        if (!currentUser) {
            return res.status(404).json({ error: "Current user not found" });
        }

        // Toggle follow/unfollow for the user
        const followerIndex = user.followers.indexOf(req.user.id);
        if (followerIndex !== -1) {
            // If already following, remove the current user from followers
            user.followers.splice(followerIndex, 1);
        } else {
            // If not following, add the current user to followers
            user.followers.push(req.user.id);
        }
        await user.save();

        // Toggle follow/unfollow for the current user
        const followingIndex = currentUser.following.indexOf(user._id);
        if (followingIndex !== -1) {
            // If already following, remove the user from following
            currentUser.following.splice(followingIndex, 1);
        } else {
            // If not following, add the user to following
            currentUser.following.push(user._id);
        }
        await currentUser.save();

        res.status(200).redirect(`/blog/myfollowers/${userId}`);

    } catch (error) {
        console.error("Error following/unfollowing user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function followfollowing(req, res) {
    try {
        const userId = req.params.id;

        // Find the user to follow/unfollow
        const user = await usermodel.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the current user
        const currentUser = await usermodel.findOne({ _id: req.user.id });
        if (!currentUser) {
            return res.status(404).json({ error: "Current user not found" });
        }

        // Toggle follow/unfollow for the user
        const followerIndex = user.followers.indexOf(req.user.id);
        if (followerIndex !== -1) {
            // If already following, remove the current user from followers
            user.followers.splice(followerIndex, 1);
        } else {
            // If not following, add the current user to followers
            user.followers.push(req.user.id);
        }
        await user.save();

        // Toggle follow/unfollow for the current user
        const followingIndex = currentUser.following.indexOf(user._id);
        if (followingIndex !== -1) {
            // If already following, remove the user from following
            currentUser.following.splice(followingIndex, 1);
        } else {
            // If not following, add the user to following
            currentUser.following.push(user._id);
        }
        await currentUser.save();

        res.status(200).redirect(`/blog/myfollowing/${userId}`);

    } catch (error) {
        console.error("Error following/unfollowing user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


async function myfollowers(req, res) {
    let id = req.params.id


    let user = await usermodel.findOne({ _id: id }).populate('followers')

    // console.log(user);

    res.status(200).render('followers', { user })
}
async function myfollowing(req, res) {
    let id = req.params.id


    let user = await usermodel.findOne({ _id: id }).populate('following')

    // console.log(user);

    res.status(200).render('following', { user })
}


export {
    homepage,
    login,
    register,
    logout,
    registeruser,
    loginuser,
    forgotpassword,
    getuserforforgotpassword,
    home,
    submit,
    updatepassword,
    contact,
    postcontact,
    checkusername,
    follow,followfollowing,
    followfollowers,
 
    myfollowing,
    myfollowers,
    aboutapp,
    reviewapp,
    postnewreview,
    deleteReview,


}