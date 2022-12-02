const express = require("express");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { userFinder, urlForUsers, generateRandomString } = require("./helpers")
const { restart } = require("nodemon");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'cookie-mate',
  keys: ['qpwoeiruty1z2x3c4v5pdsjkn', 'cmfq3948ja1-am3111sna95f'],
}))

app.use(express.urlencoded({ extended: true }));


const users = {
  "000000": {
    id: "000000",
    email: "first@hotmail.com",
    password: bcrypt.hashSync("first", 10)
  },
  "123456": {
    id: "123456",
    email: "second@hotmail.com",
    password:  bcrypt.hashSync("second", 10)
  }
};


const urlDatabase = {
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "000000",
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "000000",
  },
};



app.get("/", (req, res) => {
  res.send("Hello!");
});


app.post("/login", (req, res) => {
  const user = userFinder(req.body.email, users);

  if (user === null) {
    return res.status(403).send("Invalid entry");
  }

  if (user.email === (req.body.email) && bcrypt.compareSync(req.body.password, user.password) === true) {
    req.session.user_id = user.id;
    res.redirect('/urls');

  } else {
    return res.status(403).send("Invalid entry");
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.get("/login", (req, res) => {
  const currentUserId = req.session.user_id;
  const templateVars = { 
    urls: urlDatabase, 
    user: users[currentUserId],
  }

  if (currentUserId) {
    res.redirect("/urls");

  } else {
    res.render("urls_login", templateVars);
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const currentUserId = req.session.user_id;
  const filteredUrls = urlForUsers(currentUserId, urlDatabase);
  const templateVars = { 
    urls: filteredUrls, 
    user: users[currentUserId]
   };

   if (!currentUserId) {
     return res.send("Must login or register to continue");

   } else {
     res.render("urls_index", templateVars);
   }
});
 

app.post("/urls", (req, res) => {
  const currentUserId = req.session.user_id;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL,
    userID: currentUserId};

  if (!currentUserId) {
    res.send("You must log in to edit URLs!\n");

  } else {
    res.redirect("/urls");
  }
});


app.get("/urls/new", (req, res) => {
  const currentUserId = req.session.user_id;
  const templateVars = {
    user: users[currentUserId],
  };
 
  if (!currentUserId) {
    res.redirect("/login");

  } else {
    res.render("urls_new", templateVars);
  }
});


app.get("/urls/:id", (req, res) => {
  const currentUserId = req.session.user_id;
  const dataBaseMatch = urlForUsers(currentUserId, urlDatabase);
  const shortURL = req.params.id;
  const templateVars = { 
    id: shortURL, 
    longURL: urlDatabase[shortURL].longURL, 
    user: users[currentUserId], 
    urls: dataBaseMatch };

    if (urlDatabase[shortURL] === undefined) {
      return res.send("Error: Requested id does not exist.");
    }

    if (!currentUserId) {
      return res.send("Error: Please log in or register to continue.");

    } else if (currentUserId !== urlDatabase[shortURL].userID) {
      res.status(403).send("You can't edit a link you don't own");

    } else {
      res.render("urls_show", templateVars);
    }
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

    if (!urlDatabase[req.params.id]) {
      res.send("Short URL does not exist.");

    } else {
      res.redirect(longURL);
    }
});


app.post("/urls/:id/delete", (req, res) => {
  const currentUserId = req.session.user_id;
  //const filteredURLs = urlForUsers(currentUserId, urlDatabase);------------------------------------------------------------------------------------------------------------------------------------------------------------
  const shortURL = req.params.id;

  if (urlDatabase[shortURL] === undefined) {
    return res.send("Error: Requested id does not exist.");
  }

  if (currentUserId !== urlDatabase[shortURL].userID) {
    return res.send("Cannot delete a link you don't own");
  }

  if (!currentUserId) {
    return res.send("You must be logged in to delete.");

  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});


app.get("/urls/:id/edit", (req, res) => {
  const templateVars = { 
     id: req.params.id,
     longURL: urlDatabase[req.params.id].longURL,
     user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/edit", (req, res) => {
  const currentUserId = req.session.user_id;
  
  if (!currentUserId) {
    return res.send("You must be signed in to edit");

  } else {
   urlDatabase[req.params.id].longURL = req.body.longURL;
   res.redirect('/urls');
  }
});


app.get("/register", (req, res) => {
  const currentUserId = req.session.user_id;
  const templateVars = {
    user: users[currentUserId],
  };

  if (currentUserId) {
    res.redirect("/urls");

  } else {
    res.render("urls_register", templateVars);
  } 
});


app.post("/register", (req, res) => {
  let userID = generateRandomString();
 
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Error: Credentials are empty.");
  }

  if (userFinder(req.body.email, users) !== null) {
    return res.status(400).send("Error: User alredy exists.");
  }
  
  users[userID] =  {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  req.session.user_id = userID;
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});