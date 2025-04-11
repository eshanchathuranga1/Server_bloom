const express = require("express");
const createError = require("http-errors");

const router = express.Router();
const { login, refreshToken, logout } = require("@controllers/auth_controller"); // Import login controller
const { signAccessTocken, signRefreshTocken, verifyRefreshToken } = require("@utils/jwt_utils"); // Import JWT utility functions


router.post("/login", login); // Login route using the login controller

router.post("/refresh-token", refreshToken);

router.delete("/logout", logout);

module.exports = router;
