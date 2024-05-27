const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "passengers",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const users = mongoose.model("users", userSchema);
