import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();

async function main() {
  // Seed users
  const users = await prisma.user.createMany({
    data: [
      { name: "John Doe", email: "john.doe@example.com" },
      { name: "Jane Smith", email: "jane.smith@example.com" },
      { name: "Alice Johnson", email: "alice.johnson@example.com" },
    ],
  });

  console.log(`${users.count} users created.`);

  // Fetch all users to associate transactions
  const allUsers = await prisma.user.findMany();

  // Seed transactions
  for (const user of allUsers) {
    await prisma.account.create({
      data: {
        userId: user.id,
        balance: Math.floor(10000),
        name: "Main",
        accountNumber: crypto.randomInt(1000000000, 9999999999).toString(),
      },
    });
  }

  console.log("Accounts created for all users.");

  const allAccounts = await prisma.account.findMany();
  for (const account of allAccounts) {
    const transaction = await prisma.transaction.createMany({
      data: [
        {
          amount: Math.floor(Math.random() * 1000),
          senderId: account.id,
          receiverId: allAccounts.filter((acc) => acc.id !== account.id)[
            Math.floor(Math.random() * (allAccounts.length - 1))
          ].id,
        },
        {
          amount: Math.floor(Math.random() * 500),
          senderId: account.id,
          receiverId: allAccounts.filter((acc) => acc.id !== account.id)[
            Math.floor(Math.random() * (allAccounts.length - 1))
          ].id,
        },
      ],
    });
  }

  console.log("Transactions created for all accounts.");
  const transactions = await prisma.transaction.findMany();
  for (const transaction of transactions) {
    await prisma.account.update({
      where: { id: transaction.senderId },
      data: {
        balance: {decrement: transaction.amount},
      },
    });
    await prisma.account.update({
      where: { id: transaction.receiverId },
      data: {
        balance: {increment: transaction.amount},
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
