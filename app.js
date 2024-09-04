const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on('error',(error)=>console.log(error));
db.once('open',()=> console.log('Connected to the database'));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
}));

app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});


app.set("view engine","ejs");
app.use(require("./routes/route"));
app.listen(PORT,()=>{
    console.log(`Started at ${PORT}`);
})

app.use('/static', express.static(path.join(__dirname, 'public')));

app.set('views',path.join(__dirname,'views'));

app.use('/static', express.static( "public" ) );


app.use(express.static('public'));
app.use(express.static('files'));