const JWT = require('jsonwebtoken');
const createError = require('http-errors');

module.exports = {
    signAccessTocken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = { aud: userId }; // Payload for the token
            const secretKey = process.env.JWT_ACCESS_SECRET_KEY;
            const options = {
                expiresIn: '30d', // Token expiration time
                issuer: 'yourdomain.com', // Issuer of the token
            };
            JWT.sign(payload, secretKey, options, (err, token) => {
                if (err) {
                    reject(createError.InternalServerError('Error signing token'));
                } else {
                    resolve(token);
                }
            });
        });
    },
    signRefreshTocken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = { aud: userId }; // Payload for the token
            const secretKey = process.env.JWT_REFRESH_SECRET_KEY;
            const options = {
                expiresIn: '30d', // Token expiration time
                issuer: 'yourdomain.com', // Issuer of the token
            };
            JWT.sign(payload, secretKey, options, (err, token) => {
                if (err) {
                    reject(createError.InternalServerError('Error signing token'));
                } else {
                    resolve(token);
                }
            });
        });
    },
    verifyAccessToken: (req, res, next) => {
        if(!req.headers['authorization']) {
            return next(createError.Unauthorized());
        }
        const token = req.headers['authorization'].split(' ')[1]; // Extract token from authorization header
        if (!token) {
            return next(createError.Unauthorized('Token not provided'));
        }
        JWT.verify(token, process.env.JWT_ACCESS_SECRET_KEY, (err, payload) => {
            if (err) {
                const message = err.name === 'TokenExpiredError' ? 'Unauthorized' : err.message;
                return next(createError.Unauthorized(message)); // Handle token verification errors
            } else {
                req.payload = payload; // Attach user data to request object
                next(); // Proceed to the next middleware or route handler
            }
        });
    },
    verifyRefreshToken: (token) => {
        return new Promise((resolve, reject) => {
            const secretKey = process.env.JWT_REFRESH_SECRET_KEY;
            JWT.verify(token, secretKey, (err, decoded) => {
                if (err) {
                    reject(createError.Unauthorized('Invalid refresh token'));
                } else {
                    resolve(decoded);
                }
            });
        });
    },
    verifySocketAccessToken: (token) => {
        return new Promise((resolve, reject) => {
            JWT.verify(token, process.env.JWT_ACCESS_SECRET_KEY, (err, payload) => {
                if (err) {
                    const message = err.name === 'TokenExpiredError' ? 'Unauthorized' : err.message;
                    reject(createError.Unauthorized(message)); // Handle token verification errors
                } else {
                    resolve(payload); // Resolve with the decoded payload
                }
            });
        });
    }
}