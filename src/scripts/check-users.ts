import { PrismaClient } from "../generated/prisma/client"
import bcryptjs from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Checking users in database...")
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
    },
  })

  console.log(`Found ${users.length} users:`)
  users.forEach((user) => {
    console.log(`- Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`)
    console.log(`  Password hash: ${user.password.substring(0, 20)}...`)
  })

  // Test password
  const adminEmail = process.env.ADMIN_EMAIL || "admin@cybersport.org"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"
  
  const admin = users.find((u) => u.email === adminEmail)
  if (admin) {
    console.log(`\nTesting password for ${adminEmail}...`)
    const isValid = await bcryptjs.compare(adminPassword, admin.password)
    console.log(`Password is valid: ${isValid}`)
    
    if (!isValid) {
      console.log("❌ Password doesn't match! Regenerating...")
      const newHash = await bcryptjs.hash(adminPassword, 10)
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: newHash },
      })
      console.log("✅ Password updated!")
    }
  } else {
    console.log(`\n❌ Admin user not found! Creating...`)
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

