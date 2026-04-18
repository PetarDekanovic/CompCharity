
import { PrismaClient } from "@prisma/client";

async function test() {
  const prisma = new PrismaClient();
  try {
    console.log("Attempting to connect to database...");
    await prisma.$connect();
    console.log("SUCCESS: Database connected!");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
  } catch (e) {
    console.error("FAILURE: Could not connect to database.");
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
