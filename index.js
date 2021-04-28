const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cookieParser = require("cookie-parser");

const { auth } = require("./auth/controllers");

const app = express();


app.use(cookieParser());

const config = {
  PORT: 4000,
  HOST: "localhost",
  API_URL: "https://mighty-plains-72335.herokuapp.com/",
};

app.get("/", (req, res, next) => {
  res.send("Welcome");
});

app.use(
  "/store",
  createProxyMiddleware({
    target: config.API_URL,
    changeOrigin: true,
    pathRewrite: {
      [`^/store`]: "",
    },
  })
);

app.use("/auth", auth);

app.use('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS')
  next();
});

app.listen(config.PORT, config.HOST, () => {
  console.info(`Server started on port ${config.PORT}`);
});
