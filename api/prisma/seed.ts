
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create genres (or reuse them if they already exist)
  const genreNames = [
    'Technology',
    'Fiction',
    'Science',
    'Business',
  ];

  const genres = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const genreMap = Object.fromEntries(
    genres.map((genre) => [genre.name, genre.id]),
  );

  // Clear existing books so rerunning the seed doesn't duplicate them
  await prisma.book.deleteMany();

  const books = [
    { title: 'Clean Code', author: 'Robert C. Martin', genre: 'Technology' },
    { title: 'The Pragmatic Programmer', author: 'David Thomas', genre: 'Technology' },
    { title: 'Design Patterns', author: 'Erich Gamma', genre: 'Technology' },
    { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', genre: 'Technology' },

    { title: 'Things Fall Apart', author: 'Chinua Achebe', genre: 'Fiction' },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction' },
    { title: '1984', author: 'George Orwell', genre: 'Fiction' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fiction' },

    { title: 'A Brief History of Time', author: 'Stephen Hawking', genre: 'Science' },
    { title: 'Cosmos', author: 'Carl Sagan', genre: 'Science' },
    { title: 'The Selfish Gene', author: 'Richard Dawkins', genre: 'Science' },
    { title: 'The Origin of Species', author: 'Charles Darwin', genre: 'Science' },

    { title: 'The Lean Startup', author: 'Eric Ries', genre: 'Business' },
    { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', genre: 'Business' },
    { title: 'Zero to One', author: 'Peter Thiel', genre: 'Business' },
    { title: 'Good to Great', author: 'Jim Collins', genre: 'Business' },
  ];

  await prisma.book.createMany({
    data: books.map((book) => ({
      title: book.title,
      author: book.author,
      genreId: genreMap[book.genre],
    })),
  });

  console.log('Database seeded successfully!');
  console.log(`Genres created: ${genres.length}`);
  console.log(`Books inserted: ${books.length}`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
