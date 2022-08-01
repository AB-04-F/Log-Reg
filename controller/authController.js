const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const unirest = require("unirest");
const fileUpload = require('express-fileupload')

const bcrypt = require("bcryptjs");
const config = require("../config");
const User = require("../model/userSchema");
// const { Router } = require("express");
// const { send } = require("express/lib/response");
// const res = require("express/lib/response");

// const { off } = require("../model/userSchema");

router.use(bodyParser.urlencoded("extended : true"));
router.use(bodyParser.json());

router.get("/user", (req, res) => {
    User.find({}, (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});

// NOW WE REGISTER THE USER
router.post("/register", (req, res) => {
    console.log(req.body);
    var imageFile = null;
    if (!req.files) { return res.status(403).send({ error: 'No files were uploaded.' }); }

    let keys = Object.keys(req.files)
    if (!keys.includes(imageFile))
    //itterate multiple file fields
        for (let index = 0; index < keys.length; index++) {
        const attribute = keys[index];
        let file = req.files[attribute]

        let path = `upload/image/${Number(new Date())}_${file.name}`
        let url = `${req.hostname}/image/${Number(new Date())}_${file.name}`
        if ('imageFile' == attribute) {
            if (req.hostname == "localhost") { imageFile = `http://${url}` } else { imageFile = `https://${url}` }
        }

        //file upload function 1st parameter is path, 2nd parameter is file eg: req.files['attribute']
        await singleFileUpload(path, file);
    }


    let hashpassword = bcrypt.hashSync(req.body.password);
    User.create({
            name: req.body.name,
            email: req.body.email,
            title: req.body.title,
            body: req.body.body,
            imageFile: imageFile,
            password: hashpassword,
            loc: req.body.loc,
            //phone: req.body.phone,
            role: req.body.role ? req.body.role : "Not Active!",
        }),
        (err, data) => {
            if (err) return res.status(500).send("Error While Connecting");
            res.status(200).send("Registration Sucessfully Complete");
        };
});

//Login User
router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err)
            return res.status(500).send({ auth: false, token: "Error While Login" });
        if (!user)
            return res
                .status(200)
                .send({ auth: false, token: "No User Found First Register" });
        else {
            console.log(req.body.password);
            console.log(user.password);
            const userIsValid = bcrypt.compareSync(req.body.password, user.password);
            console.log(userIsValid);
            if (!userIsValid)
                return res.status(200).send({ auth: false, token: "Invalid user" });

            // in case email and password match then generate token
            let token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 86400,
            }); //24 hours
            res.status(200).send({ auth: true, token: token });
        }
    });
});

//User Info
router.get("/userInfo", (req, res) => {
    let token = req.headers["x-headers"];
    if (!token) res.send({ auth: false, token: "No Token Provided" });
    jwt.verify(token, config.secret, (err, user) => {
        if (err) res.status(200).send({ auth: false, token: "Invalid Token" });
        User.findById(user.id, (err, result) => {
            res.send(result);
        });
    });
});

router.get("/", (req, res) => {
    var apiCall = unirest(
        "GET",
        "https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/"
    );
    apiCall.headers({
        "x-rapidapi-host": "ip-geolocation-ipwhois-io.p.rapidapi.com",
        "x-rapidapi-key": "srclZqaa9imshAk9Xzz55u27oltLp1SqdiFjsnmva9PTpf2j3f",
    });
    apiCall.end(function(result) {
        if (res.error) throw new Error(result.error);
        console.log(result.body);
        res.send(result.body);
    });
});

module.exports = router;