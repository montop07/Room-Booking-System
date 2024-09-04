const express = require("express");
const router = express.Router();
const proposal = require("../models/proposal");
const sccc = require("../models/sccc");
const multer = require("multer");
const path = require("path");
const authenticateMiddleware = require("./authlogin");
const crypto = require("crypto");
const { name } = require("ejs");
// Create a storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.fieldname + "_" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000, // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    const extname = path.extname(file.originalname).toLowerCase();
    if (extname === ".pdf") {
      return cb(null, true);
    }
    cb(new Error("Only PDF files are allowed"));
  },
}).single("file");

router.get("/fail", (req, res) => {
  // console.log(req.session.message);  // Log the session message to check if it's set
  res.render("fail");
});

router.get("/success", (req, res) => {
  const checkstring = req.query.checkstring;
  res.render("success", {checkstring });
});


router.post('/availability', async (req, res) => {
    try {
        const { Block,ConfRoom, StartingDate } = req.body;

        // Check if there is a booking for the selected room and date with approved status 1
        const check = await proposal.findOne({
            ConfRoom: ConfRoom,
            StartingDate: StartingDate,
            approved: 1,
        });

        let status;
        if (!check) {
            status = 'Available';
            res.send(`${status}`);
        } else {
            status = 'Not available';
            res.send(`${status}`);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.get('/availability',(req,res)=>{
  res.status(201).render("availability");
});

router.get('/forward',(req,res)=>{
    res.render("forward");
});


router.post("/add", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      try {
        const length = 8;
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        let checkstring = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          checkstring += characters.charAt(randomIndex);
        }
        const newproposal = new proposal({
          Society: req.body.Society,
          EventName: req.body.EventName,
          Email: req.body.Email,
          Block:req.body.Block,
          ConfRoom: req.body.ConfRoom,
          Proposal: req.file.filename,
          Participation: req.body.Participation,
          StartingDate: req.body.StartingDate,
          approved: 0,
          checkstring: checkstring,
        });

        await newproposal.save();
        req.session.message = {
            type: "success",
            message: "Uploaded successfully",
          };
          res.redirect(`/eventsuccess?pnr=${checkstring}`);
      } catch (error) {
        req.session.message = {
          type: "danger",
          message: error.message,
        };
        res.redirect("/fail");
      }
    }
  });
});

router.post('/getStatus', async (req, res) => {
  const checkstring = req.body.check;

  try {
      const result = await proposal.findOne({ checkstring });

      if (!result) {
          return res.json({ status: 'Not Found' });
      }

      let status;
      if (result.approved === 1) {
          status = 'Accepted';
      } else if (result.approved === -1) {
          status = 'Declined';
      } else {
          status = 'Pending';
      }

      res.json({ status });  // Return the status as JSON
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getStatus',(req,res)=>{
    res.render("status");
})


router.post("/registration", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      res.json({ message: err.message, type: "danger" });
    } else {
      try {
        const newuser = new sccc({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          is_admin: 0,
        });

        await newuser.save();

        req.session.message = {
          type: "success",
          message: "Uploaded successfully ",
        };
        res.redirect("/success");
      } catch (error) {
        res.json({ message: error.message, type: "danger" });
        res.redirect("/fail");
      }
    }
  });
});

router.post("/login", async (req, res) => {
  try {
    const name = req.body.name;
    const password = req.body.password;

    const user = await sccc.findOne({ name: name });

    if (user) {
      if (user.password === password) {
        res.status(201).render("index");
      } else {
        res.status(401).send("Invalid email or password");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/eventsuccess", (req, res) => {
  res.render("eventsuccess",{name: name});
});

router.get("/", (req, res) => {
  res.render("main");
});

router.get("/registration", (req, res) => {
  res.render("registration");
});

router.get("/booking", (req, res) => {
  res.render("booking");
});
// 
router.get("/index", (req, res) => {
  res.render("index");
});

router.get("/add", (req, res) => {
  res.status(201).render("booking", {name: name});
});



module.exports = router;
