import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/userRoutes.js';
import connection from './database.js';
import blogRouter from './routes/blogRoutes.js';
// import bodyParser from 'body-parser';
import path from 'path';
import isLoggedIn from './auth/isloggedin.js';
import { config } from 'dotenv';

config();

const app = express();
app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.resolve('./public')));
app.use(cookieParser())
// app.set(isLoggedIn())


// set routes
app.use('/',router)
app.use('/blog',isLoggedIn,blogRouter)



const PORT = process.env.PORT
const KEY = process.env.KEY


// connect databse
const URL = process.env.URL;
connection(URL).then(()=>{
    console.log('connection Estalblised With DB');
})
.catch(()=>{
    console.log('Failed to connect');
})

app.listen(PORT,()=>{
    console.log(`server started at http://localhost:${PORT}`);
})