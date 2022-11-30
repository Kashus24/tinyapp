const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");



const users = {
  user1: {
    id: "000000",
    email: "first@hotmail.com",
    password: "first"
  },
  user2: {
    id: "123456",
    email: "second@hotmail.com",
    password: "second"
  }

};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



const userFinder = (email) => {
  for (let user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
  return null;
};





const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const totalC = characters.length;

  let randomed = "";
    
    for (let i = 0; i < 6; i++) {
      randomed += characters[Math.floor(Math.random() * totalC)]
    }
  return randomed;
};


app.use(express.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Hello!");
});

//adding login 
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});




app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies.user_id],

   };
   console.log("user", users)
   console.log("req", req.cookies.user_id);
  res.render("urls_index", templateVars);
});
 
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/urls/new", (req, res) => {

  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.get("/urls/:id/edit", (req, res) => {
  const templateVars = { 
     id: req.params.id,
     longURL: urlDatabase[req.params.id],
     user: users 
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/edit", (req, res) => {

   urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});



app.get("/register", (req, res) => {

  const templateVars = {
    user: users[req.cookies.user_id],
    
  };
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  let userID = generateRandomString();
 
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Credentials are empty");

  }

  if (userFinder(req.body.email === null)) {
    return res.status(400).send("user is already registered");

  }

  users[userID] =  {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }

  res.cookie('user_id', userID);
  // console.log(users)
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});