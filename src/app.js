const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const createError = require("http-errors");
const http = require("http");
const socketIo = require("socket.io");
const EventEmitter = require("events"); // Import EventEmitter for event handling

require("module-alias/register"); // Register module aliases for cleaner imports
require("dotenv").config(); // Load environment variables from .env file

const { verifyAccessToken } = require("@utils/jwt_utils"); // Import JWT utility functions
const TYPES = require("@types/events");

const realtimeDatabase = require("@utils/firebase"); // Import therealtime database module
const db = new realtimeDatabase(); // Create a new instance of the database

// Define a global event emitter for handling events
const logger = require("@utils/logger");
const connect = require("@whatsapp/connect");

const sev = new EventEmitter(); // Create a new EventEmitter instance

// Import routes
const AuthRoutes = require("@routes/auth.route");

// Import socket controllers
const { authenticateSocket } = require("@controllers/auth_socket"); // Import socket authentication controller
const waws = require("@sockets/waws"); // Import the WAWs socket controller
const { levels } = require("pino");

const app = express(); // Create an Express application

// Middleware setup
app.use(morgan("dev")); // Logging middleware
app.use(
  cors({
    origin: "*", // Allow all origins (adjust as needed for production)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
); // Enable CORS for all routes
app.use(
  helmet({
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
    referrerPolicy: { policy: "no-referrer" }, // Set referrer policy
    expectCt: true, // Enable Expect-CT
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true, // Enable XSS filter
    hidePoweredBy: true, // Hide "X-Powered-By" header
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Enable HSTS with 1-year max age
    frameguard: { action: "deny" }, // Prevent clickjacking by denying framing
    dnsPrefetchControl: { allow: false }, // Disable DNS prefetching
    ieNoOpen: true, // Enable IE no-open header
    noCache: false, // Disable no-cache header
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
  );
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; preload; includeSubDomains"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "0");
  next();
});
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

const server = http.createServer(app); // Create an HTTP server using the Express app
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins (adjust as needed for production)
    methods: ["GET", "POST"], // Allowed HTTP methods
  },
}); // Create a Socket.IO server

// Route setup
app.post("/",  async (req, res) => {
  let {option} = req.body;
  if(option === 'conn') {
    await db.update({path:'configurations/whatsapp/connections/login', data:{islogedin:true}}, async (data) =>{
        if(!data.status === 'success'){logger.warning('Whatsapp connection cannot start');}
        logger.info('Whatsapp Connection starting..')
    });
  }
});
app.use("/api/auth", AuthRoutes); // Use authentication routes

const whatsappSocket = io.of("/waws");
whatsappSocket.use(authenticateSocket);
whatsappSocket.on("connection", (socket) => waws(socket, sev));

// Non existent route handling
app.use(async (req, res, next) => {
  next(createError.NotFound("This API route is not found"));
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    },
  });
});

// Start the server
// Initialize global config with empty object
let config;

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  let socket;

  // Use the HTTP server to listen
  logger.success(`Server is listen on http://localhost:${PORT}`);
  await db.getData("configurations", sev, async (data) => {
    config = data;
  });
  await db.isUpdate(
    "configurations/whatsapp/connections/login",
    sev,
    async (data) => {
      if (data.islogedin) {
        logger.ok(`Whatsapp account allready logged in`);
        connect(sev, db);
      } else {
        logger.warning("Not connected to WhatsApp API");
      }
    }
  );
});
