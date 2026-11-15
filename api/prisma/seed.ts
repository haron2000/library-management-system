
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const librarianEmail = process.env.LIBRARIAN_EMAIL;
const librarianPassword = process.env.LIBRARIAN_PASSWORD;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

if (!librarianEmail || !librarianPassword) {
  throw new Error('LIBRARIAN_EMAIL and LIBRARIAN_PASSWORD must be defined');
}

if (librarianPassword.length < 8) {
  throw new Error('Librarian password must be at least 8 characters');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create genres or reuse existing ones
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

  // Clear existing books before inserting seed books
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

  // Create or update the librarian account
  const hashedPassword = await bcrypt.hash(librarianPassword, 10);

  const librarian = await prisma.user.upsert({
    where: { email: librarianEmail },
    update: {
      name: 'Library Librarian',
      password: hashedPassword,
      role: 'LIBRARIAN',
    },
    create: {
      name: 'Library Librarian',
      email: librarianEmail,
      password: hashedPassword,
      role: 'LIBRARIAN',
    },
  });

  console.log('Database seeded successfully!');
  console.log(`Genres available: ${genres.length}`);
  console.log(`Books inserted: ${books.length}`);
  console.log(`Librarian account: ${librarian.email}`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
