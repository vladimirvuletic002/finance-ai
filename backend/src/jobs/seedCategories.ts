import prisma from "../db/prisma";

const defaultCategories = [
  { name: "Food", icon: "🍔", color: "#FF7043" },
  { name: "Shopping", icon: "🛍️", color: "#AB47BC" },
  { name: "Transport", icon: "🚗", color: "#29B6F6" },
  { name: "Bills", icon: "💡", color: "#42A5F5" },
  { name: "Salary", icon: "💰", color: "#66BB6A" },
  { name: "Business", icon: "🧑🏻‍💼", color: "#66BB6A" },
  { name: "Entertainment", icon: "🎮", color: "#7E57C2" }
];

async function seedCategories() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const count = await prisma.category.count({
      where: { userId: user.id }
    });

    if (count === 0) {
      await prisma.category.createMany({
        data: defaultCategories.map(c => ({
          ...c,
          userId: user.id
        }))
      });
      console.log(`Added categories for user ${user.email}`);
    }
  }

  console.log("Done.");
}

seedCategories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });