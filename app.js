const express = require("express");
const mongoose = require("mongoosee");
const bcrypt = require("bcrypt");
const app = express();


app.post('/signin', async(req, res)=>{
    try{
    const {username, password} = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.create({username, password: hash});
    res.send('signup succesfull');
}catch(error){

}});

