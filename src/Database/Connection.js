const mongoose = require('mongoose');

// -------- Database Connected With Global Env File--------------
const DB = process.env.DATABASE;

// -------- Database Connection--------------
mongoose.connect(DB,{
    useNewUrlParser: true, 
    useUnifiedTopology: true})
.then(() =>{ 
    console.log('Database connected successfully')
}).catch((err) =>{ 
    console.log('No Connection',err)
});