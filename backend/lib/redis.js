import Redis from "ioredis";
import { REDIS_URI } from "./env.js";

export const redis = new Redis(REDIS_URI);
