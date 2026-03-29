import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@compcharity.ie' },
    update: {},
    create: {
      email: 'admin@compcharity.ie',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create User
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'John Doe',
      role: 'USER',
    },
  });

  // Create FAQ Items
  await prisma.fAQItem.createMany({
    data: [
      { question: 'What tech do you accept?', answer: 'We accept laptops, desktops, phones, tablets, monitors, and accessories.' },
      { question: 'How do I donate?', answer: 'Fill out the donation form on our website and choose collection or drop-off.' },
      { question: 'Is my data safe?', answer: 'Yes, we perform professional data wiping on all storage devices.' },
    ],
  });

  // Create Blog Categories
  const catRefurb = await prisma.blogCategory.create({
    data: { name: 'Refurbishment', slug: 'refurbishment' },
  });

  // Create Blog Post
  await prisma.blogPost.create({
    data: {
      title: 'The Impact of Digital Inclusion',
      slug: 'impact-of-digital-inclusion',
      content: '<p>Digital inclusion is about ensuring that everyone has access to the technology they need...</p>',
      excerpt: 'How CompCharity is helping students in Ireland.',
      published: true,
      authorId: admin.id,
      categoryId: catRefurb.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
