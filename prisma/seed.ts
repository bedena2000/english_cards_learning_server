import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'english_cards_admin',
    password: process.env.DB_PASSWORD || 'kurdgeli4',
    database: process.env.DB_NAME || 'english_cards_learning_db',
    allowPublicKeyRetrieval: true,
  }),
});

async function main() {
  await prisma.stackRating.deleteMany();
  await prisma.stackComment.deleteMany();
  await prisma.card.deleteMany();
  await prisma.stack.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.create({
    data: { email: 'alice@test.com', username: 'alice', passwordHash },
  });
  const bob = await prisma.user.create({
    data: { email: 'bob@test.com', username: 'bob', passwordHash },
  });

  const spanish = await prisma.stack.create({
    data: {
      ownerId: alice.id,
      title: 'Spanish Verbs',
      description: 'Common verbs for beginners',
      visibility: 'public',
      cards: {
        create: [
          { frontText: 'ir', backText: 'to go', position: 0 },
          { frontText: 'ser', backText: 'to be', position: 1 },
          { frontText: 'tener', backText: 'to have', position: 2 },
        ],
      },
    },
  });

  await prisma.stack.create({
    data: {
      ownerId: alice.id,
      title: 'My Private Deck',
      visibility: 'private',
      cards: {
        create: [{ frontText: 'hello', backText: 'hola', position: 0 }],
      },
    },
  });

  await prisma.stack.create({
    data: {
      ownerId: bob.id,
      title: 'English Idioms',
      description: 'Public deck by Bob',
      visibility: 'public',
      cards: {
        create: [
          {
            frontText: 'break the ice',
            backText: 'start a conversation',
            position: 0,
          },
        ],
      },
    },
  });

  await prisma.stackComment.createMany({
    data: [
      { stackId: spanish.id, userId: bob.id, content: 'Really helpful deck!' },
      { stackId: spanish.id, userId: alice.id, content: 'Thanks for using it.' },
    ],
  });

  await prisma.stackRating.createMany({
    data: [
      { stackId: spanish.id, userId: bob.id, rating: 5 },
      { stackId: spanish.id, userId: alice.id, rating: 4 },
    ],
  });

  console.log('Seed done.');
  console.log('Login: alice@test.com / password123');
  console.log('Public stack id:', spanish.id.toString());
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());