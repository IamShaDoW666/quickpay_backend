import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../utils/db";
import userRoutes from "../routes/userRoutes";
import accountRoutes from "../routes/accountRoutes";
import authRoutes from "../routes/authRoutes";
import authenticated from "../middlewares/authenticated";
import transactionRoutes from "./transactionRoutes";

const router = express.Router();

router.use("/users",authenticated, userRoutes);
router.use("/accounts", accountRoutes);
router.use("/auth", authRoutes);
router.use('/transactions', transactionRoutes)

export default router;
