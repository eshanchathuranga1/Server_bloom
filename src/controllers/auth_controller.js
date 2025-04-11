const { signAccessTocken, signRefreshTocken, verifyRefreshToken  } = require("@utils/jwt_utils"); // Import JWT utility functions
const createError = require("http-errors"); // Import HTTP error handling library
const {authSchema, refreshTokenSchema, logoutSchema} = require("@utils/auth_validator"); // Import validation schema for authentication
module.exports = {
  login: async function (req, res, next) {
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
          // Check in store
          if (global.store.has(ip)) {
            return res.status(200).json(global.store.get(ip)); // Return the stored data if it exists
          }
          // Generate tokens using the utility functions
          const accessToken = await signAccessTocken(id);
          const refreshToken = await signRefreshTocken(id);
          // Store user data in global store
          global.store.set(ip, {
            id,
            accessToken,
            refreshToken,
            location,
          });
          // send response with tokens and user data
          res.status(201).json({ accessToken, refreshToken, user: { ip, location } });
        
    } catch (error) {
        if (error.isJoi === true) next(createError.BadRequest('Invalid request parameters')); 
      return next(error);
        
    }
  },
  refreshToken: async function (req, res, next)  {
    try {
        if (!req.body) {
            throw createError.BadRequest("Request body is required");
          }
          const { refreshToken, id } = req.body; // Destructure refresh token from request body
          const result = await refreshTokenSchema.validateAsync(req.body); // Validate request body using Joi schema
          if (result.error) {
            throw createError.BadRequest("Bad request parameters");
          }
          // Verify the refresh token
          const decoded = await verifyRefreshToken(refreshToken);
          if (decoded.aud !== global.store.get(global.store.getById(id)).id) {
            throw createError.Unauthorized("Invalid refresh token");
          }
          // Generate new access token
          const accessToken = await signAccessTocken(id);
          const newRefreshToken = await signRefreshTocken(id);
          // Update the store with new tokens
          global.store.set(global.store.getByValue(id), {
            refreshToken: newRefreshToken,
            accessToken,
          });
          // Send response with new tokens
          res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      if (error.isJoi === true) next(createError.BadRequest('Invalid request parameters'));
        next(error); // Pass the error to the next middleware
    }
  },
  logout: async function (req, res, next) {
    try {
      if (!req.body) {
        throw createError.BadRequest("Request body is required");
      }
      const { ip } = req.body; // Destructure IP address from request body
      const result = await logoutSchema.validateAsync(req.body); // Validate request body using Joi schema
      if (result.error) {
        throw createError.BadRequest("Bad request parameters");
      }
      if (global.store.has(ip)) {
        global.store.add('olderLogin',{ 
            ip:ip,
            data: global.store.get(ip)
        }); // Add user data to store
        global.store.remove(ip); // Remove user data from store
        return res.status(200).json({ message: "Logout successful" });
      } else {
        throw createError.NotFound("User not found"); // User not found in store
      }
    } catch (error) {
      if (error.isJoi === true) next(createError.BadRequest('Invalid request parameters'));
      next(error)
    }
  }
};
