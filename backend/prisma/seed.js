const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'jee-neet-prep' }, update: {}, create: { name: 'JEE/NEET Prep', slug: 'jee-neet-prep', icon: '📚', description: 'Guidance from IIT/AIIMS students' } }),
    prisma.category.upsert({ where: { slug: 'campus-placements' }, update: {}, create: { name: 'Campus Placements', slug: 'campus-placements', icon: '🎓', description: 'Crack campus placement interviews' } }),
    prisma.category.upsert({ where: { slug: 'faang' }, update: {}, create: { name: 'FAANG & Big Tech', slug: 'faang', icon: '💻', description: 'Get into top tech companies' } }),
    prisma.category.upsert({ where: { slug: 'mba' }, update: {}, create: { name: 'MBA', slug: 'mba', icon: '📊', description: 'MBA prep and career advice' } }),
    prisma.category.upsert({ where: { slug: 'law' }, update: {}, create: { name: 'Law', slug: 'law', icon: '⚖️', description: 'CLAT prep and law career' } }),
    prisma.category.upsert({ where: { slug: 'startup' }, update: {}, create: { name: 'Startup', slug: 'startup', icon: '🚀', description: 'Build and scale startups' } }),
    prisma.category.upsert({ where: { slug: 'upsc' }, update: {}, create: { name: 'UPSC', slug: 'upsc', icon: '🏛️', description: 'Civil services preparation' } }),
    prisma.category.upsert({ where: { slug: 'design' }, update: {}, create: { name: 'Design', slug: 'design', icon: '🎨', description: 'UI/UX and product design' } }),
  ]);

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@helpmeman.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@helpmeman.com', passwordHash: adminHash, role: 'ADMIN', isEmailVerified: true },
  });

  console.log('✅ Seeding complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
