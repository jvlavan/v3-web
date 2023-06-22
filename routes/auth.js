const express = require("express");
const userController = require("../controllers/users");
const router = express.Router();

router.post("/register",userController.register);
router.post("/login",userController.login);
router.get("/logout", userController.logout);
router.post("/delete", userController.delete);
router.post("/forgot", userController.forgot);
// router.get("/reset-password/:token", userController.reset);
router.post("/reset", userController.reset);
module.exports = router;