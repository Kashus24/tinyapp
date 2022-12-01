const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");



const users = {
  "000000": {
    id: "000000",
    email: "first@hotmail.com",
    password: "first"
  },
  "123456": {
    id: "123456",
    email: "second@hotmail.com",
    password: "second"
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


const urlForUsers = (id) => {
  let urlMatches = {};
  for (let link in urlDatabase) {
    if (urlDatabase[link].userID === id) {
      urlMatches[link] = urlDatabase[link];
    }
  }
  return urlMatches;
};


const userFinder = (email) => {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
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
const { restart } = require("nodemon");
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Hello!");
});

//adding login 
app.post("/login", (req, res) => {

const user = userFinder(req.body.email);

  if (user === null) {
    return res.status(403).send("Invalid entry");
  }
  if (user.email === (req.body.email) && user.password === req.body.password) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    return res.status(403).send("Invalid entry");
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// get login page
// potential issue change urlDatabase ----------------------------------
app.get("/login", (req, res) => {
  const userOn = req.cookies.user_id;
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies.user_id],
  }

  if (userOn) {
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
  const currentUserId = req.cookies.user_id
  // filter urldatabase based on the user id 
  // call function urlForUsers()
  // return the filtered database
  // update template vars 
  
  const filteredUrls = urlForUsers(currentUserId)
  // console.log(filteredUrls);

  const templateVars = { 
    urls: filteredUrls, 
    user: users[currentUserId],
   };

   if (!currentUserId) {
     return res.send("Must login or register to continue")
   } else {
    res.render("urls_index", templateVars);
   }
});
 
app.post("/urls", (req, res) => {
  const userOn = req.cookies.user_id;
  let shortURL = generateRandomString();
  // Check if this is right ??
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL,
    userID: req.cookies.user_id};

  if (!userOn) {
    res.send("You must log in to edit URLs!\n")
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  const userOn = req.cookies.user_id;
  const templateVars = {
    user: users[req.cookies.user_id],
  };
 
  if (!userOn) {
    res.redirect("/login");
  } else {

  res.render("urls_new", templateVars);
  }
});


app.get("/urls/:id", (req, res) => {
  const dataCheck = urlForUsers(req.cookies.user_id);
  const userOn = req.cookies.user_id;
  const shortURL = req.params.id;
// console.log({shortURL, userOn, dataCheck });


  if (urlDatabase[shortURL] === undefined) {
  return res.send("Error: Requested id does not exist.");
}

  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[shortURL].longURL, 
    user: users[req.cookies.user_id], 
    urls: dataCheck };

    // if (urlDshortURL === undefined) {
    //   return res.send("Error: Requested id does not exit.");
    // }

    if (!userOn) {
      return res.send("Error: Please log in or register to continue.");
    } else if (userOn !== urlDatabase[shortURL].userID) {
      res.status(403).send("You can't edit a link you don't own")
    } else {
      res.render("urls_show", templateVars);
    }
});

// || userOn !== urlDatabase[shortURL].userID

app.get("/u/:id", (req, res) => {
//testing
  const longURL = urlDatabase[req.params.id].longURL;

  if (!urlDatabase[req.params.id]) {
    res.send("Short URL does not exist.");
  } else {
    res.redirect(longURL);
  }
});


app.post("/urls/:id/delete", (req, res) => {
  const filteredURLs = urlForUsers(req.cookies.user_id);

  const userOn = req.cookies.user_id;
  const shortURL = req.params.id;

  if (urlDatabase[shortURL] === undefined) {
    return res.send("Error: Requested id does not exist.");
  }
// implement urlforusers
 // if (filteredURLs !== )

if (userOn !== urlDatabase[shortURL].userID) {
  return res.send("Cannot delete a link you don't own")
}

 if (!userOn) {
    return res.send("You must be logged in to delete.")

  // } else if (userOn && dataCheck !== urlDatabase) {

  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});


app.get("/urls/:id/edit", (req, res) => {
  const templateVars = { 
     id: req.params.id,
     longURL: urlDatabase[req.params.id].longURL,
     user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/edit", (req, res) => {
  const userOn = req.cookies.user_id;
  
  if (!userOn) {
    return res.send("You must be signed in to edit")
  } else {
   urlDatabase[req.params.id].longURL = req.body.longURL;
   res.redirect('/urls');
  }
});



app.get("/register", (req, res) => {
  const userOn = req.cookies.user_id;
  const templateVars = {
    user: users[req.cookies.user_id],
  };

  if (userOn) {
    res.redirect("/urls")
  } else {
    res.render("urls_register", templateVars);
  } 
});

app.post("/register", (req, res) => {

  res.redirect("/register");
})


// register or register account ?? check out ----------------------------------- 
app.post("/registerAccount", (req, res) => {
  let userID = generateRandomString();
 
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Error: Credentials are empty.");
  }
  if (userFinder(req.body.email) !== null) {
    return res.status(400).send("Error: User alredy exists.");
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