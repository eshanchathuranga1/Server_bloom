const {
  signAccessTocken,
  signRefreshTocken,
  verifyRefreshToken,
} = require("@utils/jwt_utils"); // Import JWT utility functions
const createError = require("http-errors"); // Import HTTP error handling library
const {
  authSchema,
  refreshTokenSchema,
  logoutSchema,
} = require("@utils/auth_validator"); // Import validation schema for authentication
const {
  addUser,
  getUser,
  changeTokens,
  addTokenBlacklist,
  addUserBlacklist,
} = require("@utils/mongo.databas"); // Import MongoDB utility functions
module.exports = {
  login: async function (req, res, next) {
    console.log("Login request received!\n PROCESSING....");
    try {
      if (!req.body) {
        throw createError.BadRequest("Request body is required");
      }
      let { username, password, ip, location, id } = req.body; // Destructure username and password from request body
      // if (!username || !password || !ip || !location || !id) {
      //   throw createError.BadRequest("Bad request parameters");
      // }
      const result = await authSchema.validateAsync(req.body); // Validate request body using Joi schema
      if (result.error) {
        throw createError.BadRequest("Bad request parameters");
      }
      if (username !== "admin" || password !== "admin") {
        throw createError.Unauthorized("Invalid credentials");
      }
      // Generate tokens using the utility functions
      const accessToken = await signAccessTocken(id);
      const refreshToken = await signRefreshTocken(id);
      const dbresult = await addUser({
        id,
        tokens: {
          accessToken,
          refreshToken,
        },
        timestamp: Date.now(),
        ip,
        location,
      }); // Add user to MongoDB database
      if (dbresult.status === "exixts") {
        return res.status(200).json({
          accessToken: dbresult.data.tokens.accessToken,
          refreshToken: dbresult.data.tokens.refreshToken,
        }); // User already exists, send existing tokens
      } else if (dbresult.status === "error") {
        throw createError.InternalServerError("Error adding user"); // Error adding user to the database
      } else if (dbresult.status === "success") {
        return res.status(201).json({
          accessToken,
          refreshToken,
        }); // Send response with tokens
      }
    } catch (error) {
      if (error.isJoi === true)
        next(createError.BadRequest("Invalid request parameters"));
      return next(error);
    }
  },
  refreshToken: async function (req, res, next) {
    console.log("Refresh token request received!\n PROCESSING....");
    try {
      if (!req.body) {
        throw createError.BadRequest("Request body is required");
      }
      const { refreshToken, id } = req.body;
      const result = await refreshTokenSchema.validateAsync(req.body);
      if (result.error) {
        throw createError.BadRequest("Bad request parameters");
      }

      // Verify the refresh token
      const decoded = await verifyRefreshToken(refreshToken);
      // Check id in database
      const user = await getUser(decoded.aud);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      if (!user.data.tokens) {
        throw createError.InternalServerError("User tokens not found");
      }
      if (user.data.tokens.refreshToken !== refreshToken) {
        throw createError.Unauthorized("Invalid refresh token");
      }

      // Rest of the code remains the same
      const currentTime = Date.now() / 1000;
      const refreshTokenExpiration = decoded.exp;
      if (currentTime > refreshTokenExpiration) {
        throw createError.Unauthorized("Refresh token expired");
      }

      const accessToken = await signAccessTocken(id);
      const newRefreshToken = await signRefreshTocken(id);

      const dbresult = await changeTokens(id, {
        accessToken,
        refreshToken: newRefreshToken,
      });
      // add backlist refresh token to database
      const blackListResult = await addTokenBlacklist({
        id,
        refreshToken: user.data.tokens.refreshToken,
      });
      if (dbresult.status === "error") {
        throw createError.InternalServerError("Error updating tokens"); // Error updating tokens in the database
      } else if (dbresult.status === "success") {
        console.log("Tokens updated successfully");
      }

      res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      console.log(error);
      if (error.isJoi === true)
        next(createError.BadRequest("Invalid request parameters"));
      next(error);
    }
  },
  logout: async function (req, res, next) {
    console.log("Logout request received!\n PROCESSING....");
    try {
      if (!req.body) {
        throw createError.BadRequest("Request body is required");
      }
      const { ip } = req.body; // Destructure IP address from request body
      const result = await logoutSchema.validateAsync(req.body); // Validate request body using Joi schema
      if (result.error) {
        throw createError.BadRequest("Bad request parameters");
      }
      // get user
      const user = await getUser(result.id);
      if (!user) {
        throw createError.NotFound("User not found");
      }
      // add blacklist
      const blackListResult = await addUserBlacklist({
        id: result.id,
        ip,
        timestamp: Date.now(),
        data: result,
      });
      if (blackListResult.status === "error") {
        throw createError.InternalServerError("Error adding user to blacklist"); // Error adding user to blacklist
      }
      if (blackListResult.status === "success") {
        return res.status(200).json({
          message: "User logged out successfully",
        }); // Send response indicating successful logout
      }
    } catch (error) {
      if (error.isJoi === true)
        next(createError.BadRequest("Invalid request parameters"));
      next(error);
    }
  },
};
