import { Router } from "express";
import model from "../model.js";

const router = Router();

/**
 * API (see the route handlers below) should combine uniquely identifiable resources (paths)
 * with the appropriate HTTP request methods (GET, POST, PUT, DELETE and more) to manipulate them.
 *
 * GET     /listings                => reutrns all the listings
 * POST    /listing                 => returns listing with given id
 *
 */

router.get("/listings", (req, res) => {
  const listings = model.getListings();
  res.status(200).json({ listings });
});

router.get("/listing/:id", (res, req) => {
  const { id } = req.params;
  const listing = model.getListingById(id);

  if (listing) {
    res.status(200).json({ listing });
  } else {
    res.status(404).end();
  }
});

export default { router };
