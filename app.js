const express = require('express');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const cors = require('cors');
const cookieParser = require("cookie-parser");
const path = require('path');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended:true,limit: '50mb'}));

//static
app.use(express.static(path.join(__dirname,'./client/dist')));
app.get("*",function(req,res){
    res.sendFile(path.join(__dirname,'./client/dist/index.html'));
})

require('./src/Database/Connection');

const router = require('./src/Router/route');
app.use(router);

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log("port:",{PORT});
})

