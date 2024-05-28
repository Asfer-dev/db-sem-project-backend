import express from "express";
import mongoose from "mongoose";
import { users } from "./models/usersModel.js";
import { terminals } from "./models/terminalsModel.js";
import { credentials } from "./models/credentialsModel.js";
import { routes } from "./models/routesModel.js";
import { configDotenv } from "dotenv";
import cors from "cors";
import { buses } from "./models/busesModel.js";
//const bcrypt = require('bcrypt')

configDotenv();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello Bus Management muthafuckas!");
});

//Signing up new user
app.post("/signup", async (req, res) => {
  try {
    const User = await users.create({
      cnic: req.body.cnic,
      name: req.body.name,
      contact_no: req.body.contact_no,
      gender: req.body.gender,
    });
    const Credential = await credentials.create({
      email: req.body.email,
      password: req.body.confirmPassword,
      user: User,
    });
    res.status(200).json(Credential);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Loging in user
app.get("/login", async (req, res) => {
  console.log(req.query);
  try {
    const Credential = await credentials
      .findOne({ email: req.query.email })
      .populate([{ path: "user", strictPopulate: false }]);
    if (Credential == null) {
      return res.status(404).send("Cannot find this user!!!");
    }
    const matching = Credential.password === req.query.password;
    if (!matching) {
      return res.status(400).send("Cannot match credentials!!!");
    }
    return res.json(Credential);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Setting up /terminals route
//Get for terminals
app.get("/terminals", async (req, res) => {
  try {
    const Terminals = await terminals.find({});
    res.status(200).json(Terminals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/terminals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Terminal = await terminals.findById(id);
    res.status(200).json(Terminal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Post for terminals
app.post("/terminals", async (req, res) => {
  try {
    const Terminal = await terminals.create(req.body);
    res.status(200).json(Terminal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Put for terminals
app.put("/terminals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Terminal = await terminals.findByIdAndUpdate(id, req.body);
    if (!Terminal) {
      return res
        .status(404)
        .json({ message: "Cannot find this passenger with ID ${id}" });
    }
    const UpdatedTerminal = await terminals.findById(id);
    res.status(200).json(UpdatedTerminal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Delete for terminals
app.delete("/terminals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Terminal = await terminals.findByIdAndDelete(id);
    if (!Terminal) {
      return res
        .status(404)
        .json({ message: "Cannot find this terminal with ID ${id}" });
    }
    res.status(200).json(Terminal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const busTypes = {
  level0: "BASIC",
  level1: "EXECUTIVE",
  level2: "BUSINESS",
};

//BUSES ROUTES
app.post("/buses", async (req, res) => {
  try {
    const { route_id, type, departure } = req.body;
    const route = await routes.findById(route_id);
    const departure_time = new Date(departure);
    if (isNaN(departure_time.getTime())) {
      return res.status(400).send("Invalid date format");
    }
    const addedFare =
      type === busTypes.level0
        ? 0
        : type === busTypes.level1
        ? route.fare * 0.1
        : route.fare * 0.2;
    const Bus = await buses.create({ route, departure_time, type, addedFare });
    res.json(Bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/buses", async (req, res) => {
  try {
    const Buses = await buses.find({});
    return res.json(Buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Connecting MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log("Bus Management is running!!!");
    });
  })
  .catch((error) => console.log(error));
