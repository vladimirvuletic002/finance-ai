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
  // Ensure global default categories exist (isDefault = true, userId = null)
  for (const c of defaultCategories) {
    // cast to any to avoid TypeScript errors until Prisma client is regenerated
    const existing = await prisma.category.findFirst({
      where: ({
        isDefault: true,
        name: c.name
      } as any)
    });

    if (!existing) {
      await prisma.category.create({
        // cast data as any to avoid TS errors until `prisma generate` is run
        data: ({
          name: c.name,
          icon: c.icon,
          color: c.color,
          isDefault: true
        } as any)
      });
      console.log(`Created default category ${c.name}`);
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