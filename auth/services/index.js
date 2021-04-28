const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");

const path = "auth/db/users.json";

const getUser = (username) => {
  const users = JSON.parse(fs.readFileSync(path));

  const user = users.find((usr) => usr.username === username);

  if (user) return user;
  else return null;
};

const checkCredentials = (user) => {
  const foundUser = getUser(user.username);
  const { username, password } = user;

  const compareHash = bcrypt.compareSync(password, foundUser.password);

  if (username === foundUser.username && compareHash) {
    return jwt.sign({ user: user.username }, "tratata");
  } else {
    return null;
  }
};

const checkToken = (req, res, next) => {
  const { access_token } = req.cookies;

  jwt.verify(access_token, "tratata", (err, data) => {
    if (err) {
      res.sendStatus(403);
    } else if (data.user) {
      req.user = data.user;
      next();
    }
  });
};

module.exports = {
  getUser,
  checkCredentials,
  checkToken,
};
