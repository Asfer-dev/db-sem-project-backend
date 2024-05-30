import express from "express";
import mongoose from "mongoose";
import { users } from "./models/usersModel.js";
import { terminals } from "./models/terminalsModel.js";
import { credentials } from "./models/credentialsModel.js";
import { routes } from "./models/routesModel.js";
import { configDotenv } from "dotenv";
import cors from "cors";
import { buses } from "./models/busesModel.js";
import { tickets } from "./models/ticketsModel.js";
// import { ObjectId } from "mongodb";
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

function parseNonNegativeNumber(str) {
  // Try to parse the string as a number
  const number = parseFloat(str);

  // Check if the parsed number is a valid number and is non-negative
  if (isNaN(number) || number < 0) {
    throw new Error("Invalid or negative number");
  }

  return number;
}

// ROUTES ROUTES
app.get("/routes", async (req, res) => {
  try {
    const Routes = await routes.find({});
    res.status(200).json(Routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post("/routes", async (req, res) => {
  try {
    const {
      departure_terminal_id,
      destination_terminal_id,
      fare: fareStr,
    } = req.body;
    const departure_terminal = await terminals.findById(departure_terminal_id);
    const destination_terminal = await terminals.findById(
      destination_terminal_id
    );
    const fare = parseNonNegativeNumber(fareStr);
    const Route = await routes.create({
      departure_terminal,
      destination_terminal,
      fare,
    });
    res.status(200).json(Route);
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
    const Buses = await buses
      .find({})
      .populate([{ path: "route", strictPopulate: false }]);
    return res.json(Buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/buses/:bus_id", async (req, res) => {
  try {
    const Bus = await buses
      .findById(req.params.bus_id)
      .populate([{ path: "route", strictPopulate: false }]);
    return res.json(Bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TICKETS ROUTES
app.post("/tickets", async (req, res) => {
  try {
    const { bus_id, user_id, passengerData, seat_no } = req.body;
    let passenger = null;
    const user = await users.findById(user_id);
    if (passengerData.user_id) {
      passenger = await users.findById(passengerData.user_id);
    } else {
      passenger = await users.create({
        name: passengerData.name,
        cnic: passengerData.cnic,
        contact_no: passengerData.contact_no,
        gender: passengerData.gender,
      });
    }
    const bus = await buses.findById(bus_id);
    const Ticket = await tickets.create({ bus, user, passenger, seat_no });
    res.json(Ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/tickets", async (req, res) => {
  try {
    const { user_id } = req.query;
    const Tickets = await tickets
      .find({ user: user_id })
      .populate([{ path: "passenger", strictPopulate: false }])
      .populate([
        {
          path: "bus",
          populate: {
            path: "route",
            populate: [
              { path: "departure_terminal" },
              { path: "destination_terminal" },
            ],
          },
          strictPopulate: false,
        },
      ]);
    res.json(Tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/tickets/:bus_id", async (req, res) => {
  try {
    const bus_id = req.params.bus_id;
    const Tickets = await tickets
      .find({ bus: bus_id })
      .populate([{ path: "passenger", strictPopulate: false }]);
    res.json(Tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Ticket = await tickets.findByIdAndDelete(id);
    if (!Ticket) {
      return res
        .status(404)
        .json({ message: `Cannot find this ticket with ID ${id}` });
    }
    res.status(200).json(Ticket);
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
