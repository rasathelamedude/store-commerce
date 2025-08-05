import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    cartItems: [
      // cartItems will be an array of objects;
      {
        quantity: {
          // quantity of the product;
          type: Number,
          default: 1,
        },
        product: {
          // product ID;
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

// hashing passwords with pre-save hook;
userSchema.pre("save", async function (next) {
  try {
    // when password is not modified, no need to re-hash it (adding to cart);
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// compare passwords;
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// create model;
const User = mongoose.model("User", userSchema);

export default User;
