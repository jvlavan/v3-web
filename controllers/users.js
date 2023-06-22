const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const async = require("hbs/lib/async");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
  });

  exports.login = async(req, res) => {
    try {
        const { email, password,videolectures,nptel,slideshare,ndl,delnet,spokentutorial,blogspot,ejournal,ebooks,eshoudhsindhu,generalbookreference,newspaperandarticle} = req.body;
        // console.log(email);
        // console.log(password);
        // console.log(videolectures);
        // console.log(nptel);
        // console.log(slideshare);
        // console.log(ndl);
        // console.log(delnet);
        // console.log(spokentutorial);
        // console.log(blogspot);
let name;

        db.query("select * from users where email=?",
              [email],
              async(error,result)=>{
               
                if(result.length<=0){
                  return res.render("index",{msg:"User does not exists ,please Create account :) !"});

                }
                else{
                
                     name = result[0].NAME;
                }


                  
                  }  
            
             
              );
        let logintime = new Date();
        
            //console.log(hashedPassword);
            




              db.query("select * from users where email=?",
              [email],
              async(error,result)=>{
               
                if(result.length<=0){
                  return res.render("index",{msg:"User does not exists ,please Create account :) "});

                }
                else if(!(await bcrypt.compare(password,result[0].PASS.replace("$2y$", "$2a$")))){
                  return res.render("index",{msg:"Password does not match :(  , If you have forgotten click Forgot password ,if none works contact site admin Mr Lavan J V :)"});
                }
                else {
                   // console.log(result);
                   let category=result[0].CATEGORY;
                   let cid=result[0].CID;
                    db.query(
                      "insert into LOGIN set ?",
                      { name: name, email: email,logintime: logintime, category: category,cid:cid},
                      (error, result) => {
                        if (error) {
                          console.log(error);
                        } 
                      }
                    );
                    const id = result[0].ID;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                      expiresIn: process.env.JWT_EXPIRES_IN,
                    });

                    // console.log("The Token is " + token);
                    const cookieOptions = {
                      expires: new Date(
                        Date.now() +
                          process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                      ),
                      httpOnly: true,
                    };
                    res.cookie("lavan", token, cookieOptions);
                    res.status(200).redirect("/home");
                  


                  
                  }  
            }
             
              );
       


        
    } catch (error) {
        console.log(error);
    }
  };
exports.register = (req, res) => {
//res.send("Form submitted")  
// console.log(req.body);
// const name = req.body.name;
// const email = req.body.email;
// const password = req.body.password;
const { name, email, password ,cpassword,userid,cid} = req.body;
// console.log(name);
// console.log(email);

db.query("select email from users where email=?",[email],async (error,result) =>{
        if (error){
            console.log(error);
        }
        if(result.length > 0){
            return res.render("register",{msg:"Email ID already Taken"});
        }else if(password!==cpassword){
            return res.render("register",{msg:"Password does not match !"});
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        //console.log(hashedPassword);
        db.query(
            "insert into users set ?",
            { name: name, email: email, pass: hashedPassword ,category: userid,cid:cid},
            (error, result) => {
              if (error) {
                console.log(error);
              } else {
                //console.log(result);
                return res.render("register", {
                  msg: "User Registration Success",
                  msg_type: "good",
                });
              }
            }
          );
    }


);
};

exports.isLoggedIn = async (req, res, next) => {
  //req.name = "Check Login....";
  //console.log(req.cookies);
  if (req.cookies.lavan) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.lavan,
        process.env.JWT_SECRET
      );
      //console.log(decode);
      db.query(
        "select * from users where id=?",
        [decode.id],
        (err, results) => {
          //console.log(results);
          if (!results) {
            return next();
          }
          req.user = results[0];
          return next();
        }
      );
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
};  

exports.logout = async (req, res) => {
  try{
  const decode = await promisify(jwt.verify)(
    req.cookies.lavan,
    process.env.JWT_SECRET
  );}
  catch (error) {
    console.log(error);
    return res.status(200).redirect("/home");

    }
    const decode = await promisify(jwt.verify)(
      req.cookies.lavan,
      process.env.JWT_SECRET
    );
    
   let lo=(decode.id);
   let final=lo;
  
  db.query(
    "select * from users where id=?",
    [final],
    (err, result) => {
      //console.log(results);
      if (!result) {
        return next();
      }
      req.user = result[0];
      let lname=result[0];
      let name=lname.NAME;
      let email=lname.EMAIL;
      let userid=lname.CATEGORY;
      let logoutdate=new Date();
      let cid=lname.CID;

    db.query(
                      "insert into logout set ?",
                      { name: name, email: email,logoutdate: logoutdate,category: userid,cid:cid},
                      (error, result) => {
                        if (error) {
                          console.log(error);
                        } 
                      }
                    );
                    const id = result[0].ID;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                      expiresIn: process.env.JWT_EXPIRES_IN,
                    });

    
      //return next();
    }
  );
  
  res.cookie("lavan", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res.status(200).redirect("/");
};
function myFunction() {
  db.query("show tables",(error,result)=>{
    if (error) {
      console.log(error);
    } 
console.log(result);
  }
);}
setInterval(myFunction, 1000 * 60 * 60 * 7);


exports.delete = async(req, res) => {
  try {
      const { email, password} = req.body;
      // console.log(email);
      // console.log(password);
      // console.log(videolectures);
      // console.log(nptel);
      // console.log(slideshare);
      // console.log(ndl);
      // console.log(delnet);
      // console.log(spokentutorial);
      // console.log(blogspot);
let name;

      db.query("select * from users where email=?",
            [email],
            async(error,result)=>{
             
              if(result.length<=0){
                return res.render("delete",{msg:"User does not exists  !"});

              }
              else{
              
                   name = result[0].NAME;
              }


                
                }  
          
           
            );
      let logintime = new Date();
      
          //console.log(hashedPassword);
          




            db.query("select * from users where email=?",
            [email],
            async(error,result)=>{
             
              if(result.length<=0){
                return res.render("delete",{msg:"User does not exists  :) "});

              }
              else if(!(await bcrypt.compare(password,result[0].PASS.replace("$2y$", "$2a$")))){
                return res.render("delete",{msg:"Password does not match :(  , If you have forgotten click Forgot password ,if none works contact site admin Mr Lavan J V :)"});
              }
              else {
                 // console.log(result);
                 let category=result[0].CATEGORY;
                 let cid=result[0].CID;
                 db.query(
                  "delete from users where email=?",
                  [email],
                  (error, result) => {
                    if (error) {
                      console.log(error);
                    } 
                    // else{
                    //   return res.render("delete", {
                    //     msg: "Your account deleted Successfully !",
                    //     msg_type: "good",
                    //   });
                    // }
                  }
                );
                
                  

                  // console.log("The Token is " + token);
                
                
                  res.render("delete",{msg:"User account deleted Successfully !",msg_type:"good"});
                


                
                }  
          }
           
            );
     


      
  } catch (error) {
      console.log(error);
  }
};

// Function to generate a random reset token
function generateResetToken() {
  const length = 20;
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let resetToken = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    resetToken += characters.charAt(randomIndex);
  }

  return resetToken;
}


exports.forgot = async (req, res) => {
  try {
    const { email } = req.body;

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, result) => {
        if (error) {
          console.log(error);
          return res.render("forgot", { msg: "An error occurred", msg_type: "error" });
        }

        if (result.length <= 0) {
          return res.render("forgot", { msg: "User does not exist", msg_type: "error" });
        }

        const user = result[0];
        const resetToken = generateResetToken(); // Implement a function to generate a random reset token

        // Save the reset token and its expiration date in the database for the user
        db.query(
          "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
          [resetToken, Date.now() + 3600000, email],
          async (error, result) => {
            if (error) {
              console.log(error);
              return res.render("forgot", { msg: "An error occurred", msg_type: "error" });
            }

            // Send the password reset email
            const resetLink = `https://vec-cse-lib.lavan.net.in/reset-password/${resetToken}`; // Replace with your own website URL
            const mailOptions = {
              from: 'vecdigilib-reset@lavanmail.lavan.net.in',
              to: email,
              subject: 'Password Reset',
              html: `<!doctype html>
              <html lang="en-US">
              
              <head>
                  <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                  <title>Reset Password Email Template</title>
                  <meta name="description" content="Reset Password Email Template.">
                  <style type="text/css">
                      a:hover {text-decoration: underline !important;}
                  </style>
              </head>
              
              <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                  <!--100% body table-->
                  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8">
                      <tr>
                          <td>
                              <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                                  align="center" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <td style="height:80px;">&nbsp;</td>
                                  </tr>
                                  <tr>
                                      <td style="text-align:center;">
                                          <a href="vec-cse-lib.lavan.net.in/" target="_blank">
                                              <img width="60" src="https://veclib.lavan.net.in/assets/favicon.png" alt="">
                                          </a>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="height:20px;">&nbsp;</td>
                                  </tr>
                                  <tr>
                                      <td>
                                          <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                              style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                              <tr>
                                                  <td style="height:40px;">&nbsp;</td>
                                              </tr>
                                              <tr>
                                                  <td style="padding:0 35px;">
                                                      <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:sans-serif;">You have
                                                          requested to reset your password</h1>
                                                      <span
                                                          style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                           A link to reset your
                                                          password has been generated for you. To reset your password, click the
                                                          following link and follow the instructions.
                                                      </p>
                                                      <a href="${resetLink}"
                                                          style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                          Password</a>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="height:40px;">&nbsp;</td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="height:20px;">&nbsp;</td>
                                  </tr>
                                  <tr>
                                      <td style="text-align:center;">
                                          <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>LAVAN J V</strong></p>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="height:80px;">&nbsp;</td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <!--/100% body table-->
              </body>
              
              </html>
              `,
            };
            

            try {
              await transporter.sendMail(mailOptions);
              return res.render("forgot", { msg: "Password reset link sent to your email", msg_type: "success" });
            } catch (error) {
              console.log(error);
              return res.render("forgot", { msg: "Failed to send reset email", msg_type: "error" });
            }
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
    return res.render("forgot", { msg: "An error occurred", msg_type: "error" });
  }
};

exports.reset = (req, res) => {
  const {token, password, confirmPassword } = req.body;
 
  //console.log(password)
  if (password !== confirmPassword) {
    return res.render("reset-password", { msg: "Password does not match", msg_type: "error", token });
  }
//console.log(token);
  // Find the user with the given token
  db.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?",
    [token, Date.now()],
    async (error, result) => {
      if (error || result.length <= 0) {
        return res.render("reset-password", { msg: "Invalid or expired token", msg_type: "error", token });
      }

      const user = result[0];
      if(password!=undefined){
      const hashedPassword = await bcrypt.hash(password, 8);

      // Update the user's password and reset token
      db.query(
        "UPDATE users SET pass = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token= ?",
        [hashedPassword,token],
        (error, result) => {
          if (error) {
            console.log(error);
            return res.render("reset-password", { msg: "An error occurred", msg_type: "error", token });
          }

          return res.render("reset-password", { msg: "Password reset successful", msg_type: "success" });
        }
      );
    }}
  );
};
