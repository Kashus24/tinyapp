const userFinder = (email, database) => {
  for (let user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return null;
};


const urlForUsers = (id, database) => {
  let urlMatches = {};
    for (let link in database) {
      if (database[link].userID === id) {
       urlMatches[link] = database[link];
    }
  }
  return urlMatches;
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









module.exports = { userFinder, urlForUsers, generateRandomString };