const { db } = require("./setup");
// import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");

console.log(db);
console.log(PrismaClient);

const prisma = new PrismaClient();
console.log(prisma);
