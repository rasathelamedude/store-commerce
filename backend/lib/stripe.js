import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../config/env.js";

export const stripe = new Stripe(STRIPE_SECRET_KEY);
