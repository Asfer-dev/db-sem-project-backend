import mongoose from "mongoose";

const busesSchema = mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "routes",
    required: [true],
  },
  departure_time: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["STANDARD", "EXECUTIVE", "BUSINESS"],
  },
  addedFare: {
    type: Number,
    required: true,
  },
});

export const buses = mongoose.model("buses", busesSchema);
