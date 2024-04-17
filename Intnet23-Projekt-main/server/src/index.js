import betterLogging from "better-logging";
import express from "express";
import expressSession from "express-session";
import socketIOSession from "express-socket.io-session";
import { createServer } from "https";
import fs from "fs";
import helmet from "helmet";
import { Server } from "socket.io";
import fileupload from "express-fileupload";
import { resolvePath } from "./util.js";
import model from "./model.js";
import auth from "./controllers/auth.controller.js";
import user from "./controllers/user.controller.js";
import listing from "./controllers/listing.controller.js";

const port = 8989;
const app = express();

const options = {
  key: fs.readFileSync(resolvePath("key.pem")),
  cert: fs.readFileSync(resolvePath("server.crt")),
};

const server = createServer(options, app);
const io = new Server(server);

const { Theme } = betterLogging;
betterLogging(console, {
  color: Theme.green,
});

// Enable debug output
console.logLevel = 4;

// Register a custom middleware for logging incoming requests
app.use(
  betterLogging.expressMiddleware(console, {
    ip: { show: true, color: Theme.green.base },
    method: { show: true, color: Theme.green.base },
    header: { show: false },
    path: { show: true },
    body: { show: true },
  })
);

// Configure session management
const sessionConf = expressSession({
  secret: "Super secret! Shh! Do not tell anyone...",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionConf);
io.use(
  socketIOSession(sessionConf, {
    autoSave: true,
    saveUninitialized: true,
  })
);

// Serve static filesç
app.use(express.static(resolvePath("client", "dist")));

// Register middlewares that parse the body of the request, available under req.body property
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Protects against XSS attacks
app.use(helmet());

// Needed for image upload
app.use(fileupload());

// Bind REST controllers to /api/*
app.use("/api", auth.checkTimer, auth.router);
app.use("/api", auth.checkTimer, listing.router); //
app.use("/api", auth.checkTimer, auth.requireAuth, user.router); //

// Initialize a model
model.init(io);
await model.initListings();

// Handle socket.io connections
io.on("connection", (socket) => {
  const { session } = socket.handshake;
  session.socketID = socket.id;
  session.save((err) => {
    if (err) console.error(err);
    else console.debug(`Saved socketID: ${session.socketID}`);
  });
});

server.listen(port, () => {
  console.log(`Listening on https://localhost:${port}/`);
});

app.get("/images/:id", (req, res) => {
  const { id } = req.params;
  console.log(resolvePath("server", "src", "images", `${id}.png`));
  res.sendFile(resolvePath("server", "src", "images", `${id}.png`));
});

app.get("*", (req, res) => {
  res.redirect("/");
});
