import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const demoPassword = await hashPassword("CalloutDemo!2026");
  const adaPassword = await hashPassword("CalloutAda!2026");

  const demo = await prisma.user.upsert({
    where: { email: "demo@callout.social" },
    update: {},
    create: {
      email: "demo@callout.social",
      username: "demo",
      displayName: "Demo Trader",
      bio: "A Callout Social member. Not a Pump.fun account.",
      passwordHash: demoPassword,
      avatarColor: "#3DFF8F",
    },
  });

  const ada = await prisma.user.upsert({
    where: { email: "ada@callout.social" },
    update: {},
    create: {
      email: "ada@callout.social",
      username: "ada",
      displayName: "Ada",
      bio: "Writes notes on Callout Social. Does not publish to Pump.fun.",
      passwordHash: adaPassword,
      avatarColor: "#7DD3FC",
    },
  });

  const existing = await prisma.nativePost.count({ where: { authorId: { in: [demo.id, ada.id] } } });
  if (existing === 0) {
    await prisma.nativePost.create({
      data: {
        authorId: demo.id,
        body: "Welcome to Callout Social. Posts written here stay on this site. They are not Pump.fun Callouts.",
      },
    });
    await prisma.nativePost.create({
      data: {
        authorId: ada.id,
        body: "Look up a token by its mint address. Market figures show up only when coins-v2 returns them.",
      },
    });
  }

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: demo.id, followingId: ada.id } },
    update: {},
    create: { followerId: demo.id, followingId: ada.id },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
