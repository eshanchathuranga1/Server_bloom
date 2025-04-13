const createError = require("http-errors"); // Import HTTP error handling library
const {
  verifyAccessToken,
  verifySocketAccessToken,
} = require("@utils/jwt_utils"); // Import JWT utility functions
const { getUser } = require("@utils/mongo.databas");
module.exports = {
  authenticateSocket: async (socket, next) => {
    const token = socket.handshake.headers["authorization"]; // Get the access token from headers
    if (!token) {
      return next(createError.Unauthorized("Token not provided")); // Handle missing token
    }
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return next(createError.Unauthorized("Invalid token format")); // Handle invalid token format
    }
    const accessToken = tokenParts[1]; // Extract the access token
    try {
      const payload = await verifySocketAccessToken(accessToken); // Verify the access token
      const user = await getUser(payload.aud); // Get the user from the database
      if (!user) {
        return next(createError.Unauthorized("User not found")); // Handle user not found
      }
      socket.userId = payload.aud; // Attach user ID to the socket object
      next(); // Proceed to the next middleware or event handler
    } catch (error) {
      return next(createError.Unauthorized(error.message)); // Handle token verification errors
    }
  },
};
