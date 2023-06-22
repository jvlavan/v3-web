const express = require("express");
const router = express.Router();
const infos = require("./link")
const userContoller = require("../controllers/users");
router.get("/",(req,res) => {
   
    res.render("index");

});
router.get("/register",(req,res) => {
   
    res.render("register");

});

// router.get("/forgot",(req,res) => {
   
//     res.render("forgot");

// });
router.get("/profile", userContoller.isLoggedIn, (req,res) => {
   
    if (req.user) {
        res.render("profile", { user: req.user });
      } else {
    res.render("./");
      }
});
router.get("/home", userContoller.isLoggedIn, (req,res) => {
   
    if (req.user) {
        res.render("home", { user: req.user });
      } else {
    res.render("./");
      }

});
router.get("/delete",(req,res) => {
   
  res.render("delete");

});
router.get("/forgot",(req,res) => {
   
  res.render("forgot");

});
router.get("/reset-password/:token", (req, res) => {
  const token = req.params.token;
  res.render("reset-password", { token });
});


router.get("/slideshare", userContoller.isLoggedIn, (req,res) => {
   
    if (req.user) {
        res.render("slideshare", { user: req.user });
      } else {
    res.render("./");
      }

});
router.get("/displayBooks", userContoller.isLoggedIn, (req,res) => {
    if (req.user) {
        res.render("displayBooks", { user: req.user });
      } else {
    res.render("./");
      }

});
router.get("/video", userContoller.isLoggedIn, (req,res) => {
  if (req.user) {
      res.render("home.ejs", { user: req.user });
    } else {
  res.render("./");
    }

});
router.get("/video/:videoid", userContoller.isLoggedIn, (req,res) => {
  if (req.user) {
    const id = req.params.videoid;
    //console.log(id);
    for(let i = 0;i<infos.length ; i++)
    {
        if(infos[i][0] == id)
        {
            res.render("video.ejs" , {link:infos[i][1] , description : infos[i][2]})
        }
    }
    } else {
  res.render("./");
    }

});




module.exports = router;