import mongoose from "mongoose";

const ticketsSchema = mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "buses",
    required: [true],
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true],
  },
  seat_no: {
    type: Number,
    required: [true],
  },
});

export const tickets = mongoose.model("tickets", ticketsSchema);
