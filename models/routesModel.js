import mongoose from "mongoose";

const routesSchema = mongoose.Schema({
  departure_terminal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "terminals",
    required: [true],
  },
  destination_terminal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "terminals",
    required: [true],
  },
  fare: {
    type: Number,
    required: [true],
  },
});

export const routes = mongoose.model("routes", routesSchema);
