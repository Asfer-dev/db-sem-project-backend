import mongoose from "mongoose";

const credentialsSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
    strictPopulate: false,
  }
);

export const credentials = mongoose.model("credentials", credentialsSchema);
