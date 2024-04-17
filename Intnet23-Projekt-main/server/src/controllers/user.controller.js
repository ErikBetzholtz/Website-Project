import { Router } from "express";
import model from "../model.js";

const router = Router();

/**
 * API (see the route handlers below) should combine uniquely identifiable resources (paths)
 * with the appropriate HTTP request methods (GET, POST, PUT, DELETE and more) to manipulate them.
 *
 * POST     /createListing              => creates a listing
 * POST     /removeListing              => removes a listing
 * PUT      /buyListing                 => buys a listing
 * GET      /getUser                    => returns username coresponding the sessionId
 *
 */

router.post("/createListing", (req, res) => {
  const { listingName, description, price } = JSON.parse(req.body.jsonData); // behöver konvertera data till image
  const { id: sessionId } = req.session;
  const user = model.findUserById(sessionId);
  const { myImage } = req.files;
  const imageId = Math.floor(Math.random() * 1000000000);
  const path = `../server/src/images/${imageId}.png`;
  myImage.mv(path, (error) => {
    if (error) {
      console.log(error);
      res.writeHead(500, {
        "Content-Type": "application/json",
      });
    }
  });

  model
    .createListing(
      listingName,
      user.email,
      user.username,
      description,
      price,
      imageId
    )
    .then((success) => {
      if (success) {
        res.status(200).end();
      } else {
        res.status(404).end();
      }
    });
});

router.delete("/removeListing", (req, res) => {
  const { listingId } = req.body;
  const { id: sessionId } = req.session;
  const user = model.findUserById(sessionId);
  model.removeListing(listingId, user.email).then((success) => {
    if (success) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  });
});

router.put("/buyListing", (req, res) => {
  const { listingId } = req.body;
  const { id: sessionId } = req.session;
  const user = model.findUserById(sessionId);
  model.buyListing(listingId, user.email).then((success) => {
    if (success) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  });
});

router.get("/getUser", (req, res) => {
  const { id: sessionId } = req.session;
  const user = model.findUserById(sessionId);

  if (user) {
    res.status(200).json({ username: user.username, email: user.email });
  } else {
    res.status(404).json({ username: undefined, email: undefined });
  }
});

router.post("/saveImage", (req, res) => {
  model.getListings();
  res.status(200).end();
});

router.get("/getImage", (req, res) => {
  res.sendFile();
});

export default { router };
