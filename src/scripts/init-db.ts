import { PrismaClient } from "../generated/prisma/client"
import bcryptjs from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = process.env.ADMIN_EMAIL || "admin@cybersport.org"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcryptjs.hash(adminPassword, 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Administrator",
        username: "admin",
        role: "ADMIN",
      },
    })
    console.log(`✅ Admin user created: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

