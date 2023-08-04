import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Conncection with the database.
mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "practice"
}).then(() => {
    console.log("DataBase Connceted");
}).catch(err => { console.log(err); });

// Schema
const schema = new mongoose.Schema({
    name: String,
    email: String,
    passowrd: String,
});

// Model.
const User = new mongoose.model("user", schema);

const app = express();

// Using middlewears.
app.use(express.static(path.join(path.resolve(), "public"))); //used to access the public folder.
app.use(express.urlencoded({ extended: true })); // For getting value from the form.
app.use(cookieParser()); // For geting the values of the cookies.

// Setting up the view engine.
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
})

app.post("/login", (req, res) => {
    res.cookie("token", "value", {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    })
    res.render("logout");
})

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    const userPresentOrNot = await User.findOne({ email }); // Here we are checking if the user that is registering is already registered or not.

    if (userPresentOrNot) {
        return (res.render("login"));
    }

    // We also cannot store the password openly in the DB. It will be a big blunder, maa chude jabe bara..
    const hashedPassword = await bcrypt.hash(userPresentOrNot.passowrd, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    // Now here we have to store the id of the user in the token. But it should not be visible.
    const token = jwt.sign({ _id: user._id }, "fjeivner");

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    });

    res.render("logout", { name })

})

app.get("/logout", (req, res) => {
    console.log(req.cookies);
    res.cookie("token", "value", {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.redirect("/")
})

app.listen(5000, (req, res) => {
    console.log("Server Working");
});

