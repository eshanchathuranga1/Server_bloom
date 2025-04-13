const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const createError = require('http-errors');
const http = require('http');
const socketIo = require('socket.io');
const EventEmitter = require('events'); // Import EventEmitter for event handling

require('module-alias/register'); // Register module aliases for cleaner imports
require('dotenv').config(); // Load environment variables from .env file

const {verifyAccessToken} = require('@utils/jwt_utils'); // Import JWT utility functions


const realtimeDatabase = require('@utils/firebase')
const db = new realtimeDatabase()


// Define a global event emitter for handling events
const ev = new EventEmitter(); // Create a new EventEmitter instance



// Import routes
const AuthRoutes = require('@routes/auth.route');

// Import socket controllers
const {authenticateSocket} = require('@controllers/auth_socket'); // Import socket authentication controller
const waws = require('@sockets/waws'); // Import the WAWs socket controller


const app = express(); // Create an Express application

// Middleware setup
app.use(morgan('dev')); // Logging middleware
app.use(cors({
    origin: '*', // Allow all origins (adjust as needed for production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
})); // Enable CORS for all routes
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], // Restrict default sources to self
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow scripts from self and inline scripts
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow styles from self and inline styles
            imgSrc: ["'self'", "data:"], // Allow images from self and data URIs
            connectSrc: ["'self'"], // Restrict connections to self
            fontSrc: ["'self'", "https:"], // Allow fonts from self and HTTPS sources
            objectSrc: ["'none'"], // Disallow object sources
            frameSrc: ["'none'"], // Disallow framing
        },
    },
    referrerPolicy: { policy: 'no-referrer' }, // Set referrer policy
    expectCt: true, // Enable Expect-CT
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true, // Enable XSS filter
    hidePoweredBy: true, // Hide "X-Powered-By" header
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Enable HSTS with 1-year max age
    frameguard: { action: 'deny' }, // Prevent clickjacking by denying framing
    dnsPrefetchControl: { allow: false }, // Disable DNS prefetching
    ieNoOpen: true, // Enable IE no-open header
    noCache: false, // Disable no-cache header
}));

app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; preload; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '0');
    next();
});
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

const server = http.createServer(app); // Create an HTTP server using the Express app
const io = socketIo(server, {
    cors: {
        origin: '*', // Allow all origins (adjust as needed for production)
        methods: ['GET', 'POST'], // Allowed HTTP methods
    },
}); // Create a Socket.IO server


// Route setup
app.get('/', verifyAccessToken, (req, res) => {
    res.send('Hello World!'); // Simple route for testing
});
app.use('/api/auth', AuthRoutes); // Use authentication routes




const whatsappSocket = io.of('/waws'); 
whatsappSocket.use(authenticateSocket);
whatsappSocket.on('connection', (socket)=> waws(socket, ev));





// Non existent route handling
app.use(async(req, res, next) => {
    next(createError.NotFound('This API route is not found'));
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            status: err.status || 500,
            message: err.message || 'Internal Server Error',
        },
    })
})

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { // Use the HTTP server to listen
    console.log(`Server is running on port ${PORT}`);
});