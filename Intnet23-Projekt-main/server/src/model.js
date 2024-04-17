import bcrypt from "bcrypt";
import User from "./models/user.model.js";
import db from "./db.js";
import Listing from "./models/listing.model.js";

class Model {
  constructor() {
    this.users = {};
    this.listings = [];

    this.io = undefined;
  }

  /**
   * Initialize the model after its creation.
   * @param {SocketIO.Server} io - The socket.io server instance.
   * @returns {void}
   */
  init(io) {
    this.io = io;
  }

  /**
   * Login a user with given username and password
   * if the login is succesfull, the function will return true.
   * @param {String} username - The username given by the user
   * @param {String} password - The password given by the user
   * @param {String} sessionId - Unique identifier for the session
   * @returns {boolean}
   */
  async login(email, password, sessionId) {
    const stmt = await db.prepare("SELECT * FROM users WHERE email = ?");
    await stmt.bind({ 1: email });
    const result = await stmt.get();

    if (result !== undefined) {
      if (await bcrypt.compare(password, result.password)) {
        this.users[sessionId] = new User(email, result.username);
        return true;
      }
      console.log("password doesn't match");
    }
    return false;
  }

  /**
   * Invalidate session
   * @param {String} sessionId - session to be invalidated.
   */
  logout(sessionId) {
    this.users[sessionId] = undefined;
  }

  getListings() {
    return this.listings;
  }

  findListingById(listingId) {
    return this.listings.find(
      (listing) => listing.id === parseInt(listingId, 10)
    );
  }

  findUserByEmail(email) {
    return Object.values(this.users).find((user) => user.email === email);
  }

  /**
   * Return the user object with the matching id.
   * @param {String} id - An unique identifier for the user session.
   * @returns {User}
   */
  findUserById(id) {
    return this.users[id];
  }

  /**
   * Create a user with the given name.
   * @param {String} username - An unique identifier for the user.
   * @param {String} fullname - fullname of the user
   * @param {String} password - password
   * @returns {boolean} - true if registration was succesull, false otherwise
   */
  // eslint-disable-next-line class-methods-use-this
  async registerUser(email, username, password) {
    const stmt = await db.prepare("SELECT * FROM users WHERE email = ?");
    await stmt.bind({ 1: email });
    const matches = await stmt.get();
    if (
      email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/) &&
      matches === undefined
    ) {
      const stmt2 = await db.prepare(
        "INSERT INTO users(email, username, password) VALUES(?, ?, ?)"
      );
      bcrypt.hash(password, 10, async (error, hash) => {
        await stmt2.bind({ 1: email, 2: username, 3: hash });
        await stmt2.run();
      });

      return true;
    }
    return false;
  }

  async initListings() {
    const rows = await db.all("SELECT * FROM listings");
    rows.forEach((row) => {
      this.listings.push(
        new Listing(
          row.id,
          row.name,
          row.email,
          row.username,
          row.description,
          row.price,
          row.img,
          row.buyerid
        )
      );
    });
  }

  async createListing(
    listingName,
    email,
    username,
    description,
    price,
    imageId
  ) {
    try {
      const listingId = Math.floor(Math.random() * 1000000000);

      const stmt = await db.prepare(
        "INSERT INTO listings(id, name, email, username, description, price, img, buyerid) VALUES(?, ?, ?, ?, ?, ?, ?, ?)"
      );
      await stmt.bind({
        1: listingId,
        2: listingName,
        3: email,
        4: username,
        5: description,
        6: price,
        7: imageId,
        8: "",
      });
      await stmt.run();

      this.listings.push(
        new Listing(
          listingId,
          listingName,
          email,
          username,
          description,
          price,
          imageId,
          ""
        )
      );
      this.broadcast();
      return true;
    } catch {
      return false;
    }
  }

  async removeListing(listingId) {
    try {
      this.listings = this.listings.filter(
        (listing) => listing.id !== listingId
      );
      const stmt = await db.prepare("DELETE FROM listings WHERE id = ?");
      await stmt.bind({ 1: listingId });
      await stmt.run();
      this.broadcast();
      return true;
    } catch {
      return false;
    }
  }

  async buyListing(listingId, buyerEmail) {
    if (this.findListingById(listingId)) {
      this.findListingById(listingId).buyer = buyerEmail;
      const stmt = await db.prepare(
        "UPDATE listings SET buyerid = ? WHERE id = ?"
      );
      await stmt.bind({ 1: buyerEmail, 2: listingId });
      await stmt.run();
      this.broadcast();
      return true;
    }
    return false;
  }

  /**
   * Push out a message to all connected clients in the given room.
   * @param {Room} room - The room to add the message to.
   * @param {String} message - The message to add.
   * @returns {void}
   */
  broadcast() {
    this.io.emit("listings", this.listings);
  }
}

export default new Model();
