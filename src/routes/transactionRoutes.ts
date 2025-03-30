import authenticated from "../middlewares/authenticated";
import db from "../utils/db";
import { sendError, sendSuccess } from "../utils/network";
import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  const transactions = await db.transaction.findMany({
    include: { sender: true, receiver: true },
  });
  sendSuccess(res, transactions);
});

router.post("/pay", authenticated, async (req, res) => {
  const { amount, senderId, receiverId } = req.body;
  if (!amount || !senderId || !receiverId) {
    sendError(res, "Missing required fields", 400);
    return;
  }
  if (amount <= 0) {
    sendError(res, "Amount must be greater than 0", 400);
    return;
  }
  if (senderId === receiverId) {
    sendError(res, "Sender and receiver cannot be the same", 400);
    return;
  }
  const senderAccount = await db.account.findUnique({
    where: { accountNumber: senderId.toString() },
  });
  const receiverAccount = await db.account.findUnique({
    where: { accountNumber: senderId.toString() },
  });
  if (!senderAccount || !receiverAccount) {
    sendError(res, "Sender or receiver account not found", 404);
    return;
  }
  if (senderAccount.balance < amount) {
    sendError(res, "Insufficient funds", 400);
    return;
  }
  try {
    await db.account.update({
      where: { accountNumber: senderId.toString() },
      data: { balance: { decrement: amount } },
    });

    await db.account.update({
      where: { accountNumber: receiverId.toString() },
      data: { balance: { increment: amount } },
    });
  } catch (err) {
    sendError(res, "Transaction failed", 500);
    return;
  }
  // Create transaction record
  const transaction = await db.transaction.create({
    data: {
      amount,
      sender: { connect: { accountNumber: senderId.toString() } },
      receiver: { connect: { accountNumber: receiverId.toString() } },
    },
  });
  sendSuccess(res, transaction);
});

export default router;
