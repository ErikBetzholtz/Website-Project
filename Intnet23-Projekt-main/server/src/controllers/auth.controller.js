import { Router } from "express";
import model from "../model.js";

const router = Router();
let timer;
let timerRunning = true;

/**
 * API (see the route handlers below) should combine uniquely identifiable resources (paths)
 * with the appropriate HTTP request methods (GET, POST, PUT, DELETE and more) to manipulate them.
 *
 * GET     /users/me                       =>  return true if user is authenticated.
 * POST    /login                          =>  authenticate user, return authenticated = true if succesful, false otherwise.
 * GET     /logout                         =>  invalidetes the session.
 * POST    /RegisterUser                   => registers user with username, fullname, password.
 *
 */

/**
 * requireAuth is a middleware function that limit access to an endpoint to authenticated users.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */
const requireAuth = (req, res, next) => {
  const { id } = req.session;
  const user = model.findUserById(id);

  if (user === undefined) {
    res.status(401).end();
    return;
  }
  next();
};

function resetTimer() {
  function onTimeout() {
    clearTimeout(timer);
    timerRunning = false;
  }
  timerRunning = true;
  timer = setTimeout(onTimeout, 30000);
}

const checkTimer = (req, res, next) => {
  const { id: sessionId } = req.session;
  if (model.findUserById(sessionId)) {
    if (timerRunning) {
      resetTimer();
      next();
    } else {
      model.logout(sessionId);
      timerRunning = true;
      next();
    }
  } else {
    next();
  }
};

router.get("/users/me", (req, res) => {
  const { id: sessionId } = req.session;
  const user = model.findUserById(sessionId);

  res.status(200).json({ authenticated: user !== undefined });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const { id: sessionId } = req.session;

  if (model.findUserById(sessionId) === undefined) {
    model.login(email, password, sessionId).then((succsesfulLogin) => {
      resetTimer();
      res.status(200).json({ authenticated: succsesfulLogin });
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

router.get("/logout", (req, res) => {
  const { id: sessionId } = req.session;
  model.logout(sessionId);
  res.status(200).json({ msg: "Logout succesful" });
});

router.post("/registerUser", (req, res) => {
  const { email, username, password } = req.body;
  model
    .registerUser(email, username, password, req.sessionID)
    .then((succsesfulRegistration) => {
      res.status(200).json({ registered: succsesfulRegistration });
    });
});

export default { router, requireAuth, checkTimer };
