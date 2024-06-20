import usermodel from "../models/user.js";
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

const KEY = process.env.KEY;

function isLoggedIn(req, res, next) {
    let token = req.cookies.token
    if (!token) {
      return  res.status(200).redirect('/')
    }
    else {
        try {
            let user = jwt.verify(token, KEY)
            req.user = user
        } catch (error) {
            res.status(200).redirect('/')
        }
    }
    next();
}


export default isLoggedIn