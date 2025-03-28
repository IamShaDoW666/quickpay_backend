import db from "../utils/db";
import { Response, Request } from "express";
import { sendError, sendSuccess } from "../utils/network";

const getAllAccounts = async (req: Request, res: Response) => {
  const { withUsers } = req.query;
  const accounts = await db.account.findMany({
    include: {
      user: withUsers == "true",
    },
  });
  sendSuccess(res, accounts);
};

const getAccountById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const account = await db.account.findUnique({
    where: {
      id: id,
    },
  });
  if (!account) {
    sendError(res, "Account not found", 404);
    return;
  }
  sendSuccess(res, account);
};

const createAccount = async (req: Request, res: Response) => {
  const { name, balance, accountNumber, userId } = req.body;
  const account = await db.account.create({
    data: {
      name,
      balance,
      accountNumber,
      userId,
    },
  });
  if (!account) {
    sendError(res, "Account creation failed", 500);
    return;
  }
  sendSuccess(res, account, "Account created successfully", 201);
};

const updateAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, balance, accountNumber, userId } = req.body;

  const account = await db.account.update({
    where: {
      id: id,
    },
    data: {
      name,
      balance,
      accountNumber,
      userId,
    },
  });
  sendSuccess(res, account, "Account updated successfully");
};

const deleteAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const response = await db.account.delete({
    where: {
      id: id,
    },
  });
  sendSuccess(res, response, "Account deleted successfully", 204);
};

const accountController = {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};

export default accountController;
