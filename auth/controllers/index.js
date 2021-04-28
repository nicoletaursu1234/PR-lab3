const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const bodyParser = require("body-parser");

const { getUser, checkCredentials, checkToken } = require("../services");

const auth = express.Router();
const salt = bcrypt.genSaltSync(10);
const path = "auth/db/users.json";

auth.use(bodyParser.urlencoded({ extended: true }));
auth.use(bodyParser.json());

auth.post("/login", (req, res) => {
  const { username, password } = req.body;

  const token = checkCredentials({ username, password });

  if (token) {
    res.cookie("access_token", token, { maxAge: 600000, httpOnly: true });
    res.status(200).json({
      message: "Logged in successfully",
      isAuthenticated: true,
      user: { username },
    });
  } else {
    res.status(401).json({ message: "Wrong credentials" });
  }
});

auth.post("/signup", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(path));
  const userInDb = getUser(username);

  if (!userInDb) {
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = [...users, { username, password: hashedPassword }];

    fs.writeFileSync(path, JSON.stringify(newUser));
    res.status(200).json({ message: "Successfully created new account" });
  } else {
    res.json({
      message: "This username already exists. Please choose another one.",
    });
  }
});

auth.delete("/:username", (req, res) => {
  const { username } = req.params;

  const users = JSON.parse(fs.readFileSync(path));
  const userInDb = getUser(username);

  if (userInDb) {
    const updatedDb = users.filter((user) => user.username !== username);

    fs.writeFileSync(path, JSON.stringify(updatedDb));
    res.status(200).send(`Successfully deleted user ${username}`);
  } else if (!userInDb) {
    res.json({ message: "No user was found. Please check the username." });
  } else {
    res.json({ message: "Something went wrong. Please try again" });
  }
});

auth.get("/check", checkToken, (req, res) => {
  if (req.user) res.status(200).json({ isAuthenticated: true, user: req.user });
  else res.status(401).json({ message: "Please login." });
});

module.exports = {
  auth,
  getUser,
  checkCredentials,
  checkToken,
};
