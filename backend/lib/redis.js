import Redis from "ioredis"
import { REDIS_URI } from "../config/env.js";

export const redis = new Redis(REDIS_URI);