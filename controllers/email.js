import nodemailer from 'nodemailer'
import { config } from 'dotenv';

config();

const EMAIL = process.env.EMAIL;
const EPASS = process.env.EPASS;

const transport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EPASS
    },
  })


  export default transport