//jshint esversion:6
import dotenv from 'dotenv';
dotenv.config(); 
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import md5 from "md5"
import bcrypt from "bcrypt"

const saltRounds = 5
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
 
let conn = await mongoose.connect(process.env.MONGODB)

const Posts = mongoose.model('Post', postSchema);
const User = mongoose.model('User', userSchema);

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));





app.get("/", async (req,res) => {
  let allPosts = await Posts.find({});
  console.log(allPosts.length)
  if (allPosts.length>4){
    res.render("home", {posts1: allPosts})
  }else{
    res.render("home2", {posts1: allPosts})
  }
})

app.get("/register", function(req,res) {
  res.render("register")
})


app.post("/register", async (req,res) => {

  bcrypt.hash(req.body.password, saltRounds, async (err,hash)=>{
    let newUser =  {
      userEmail: req.body.email,
      userPassword: hash
    }
    
  await User.create({ email: newUser['userEmail'], password: newUser['userPassword']})
  if(err){
    console.log(err)
  }else{
    res.redirect("/")
  }

  })
})

app.get("/login", function(req,res) {
  res.render("login")
})


app.post("/login", async (req,res) => {
    let userEmail= req.body.email
    let userPassword= req.body.password

    let foundUser = await User.findOne({email: userEmail} )
   
    bcrypt.compare(userPassword,foundUser.password,function(err,result){
      if(result===true){
        console.log("successfully logged in")
        res.redirect("/")
      }else{
        res.render("wrongcredentials")
      }
    })
  })



        // if(foundUser){
        //   if(foundUser.password === userPassword){
        //     res.render("home")
        //   }else{
        //     res.render("wrongcredentials")
        //   }
        // }else{
        //   res.render("wrongcredentials")
        // }
  
   
  // res.redirect("/")


app.get("/about", function(req,res) {
  res.render("about", {about: aboutContent})
})

app.get("/contact", function(req,res) {
  res.render("contact", {contact: contactContent})
})

app.get("/newpost", function(req,res) {
  res.render("newpost")
})

app.get("/posts/:topic", async (req,res) => {
   let titleOfReadMorePost = [req.params.topic];
   console.log(titleOfReadMorePost)
   let foundPost = await Posts.find({title: titleOfReadMorePost});
   console.log(foundPost)
   res.render("post",{pTitle: foundPost[0].title, pBody: foundPost[0].content});
})

app.get("/post/:topic/edit", async (req,res) => {
  //res.send("the post has been edited")
  console.log(req.params.topic)
  let previousTitle = req.params.topic
  res.render("edit", {p: previousTitle})  
})

app.post("/post/:topic/edit", async (req,res) => {
 
  await Posts.updateOne({title: req.params.topic}, {$set : {title: req.body.postTitle, content: req.body.postBody}})
  res.render("edited")
})


app.get("/post/:topic/delete", async (req,res) => {
  let toBeDeletedPost = req.params.topic

  await Posts.deleteOne({title: toBeDeletedPost })
  res.render("delete")
})


app.post("/newpost", async (req,res) => {
  let post = {
    title: req.body.postTitle,
    post: req.body.postBody
  }
  await Posts.create({ title: post['title'], content: post['post'] })
  res.redirect("/")
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});

