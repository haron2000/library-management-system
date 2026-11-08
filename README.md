<WritingBlock id="62841" variant="document"># Schema Decisions
Relational Data Model
The library catalog uses PostgreSQL with Prisma ORM to manage three core entities: User, Genre, and Book.
- User: Stores library user information, including name, unique email address, and role. The Role enum restricts users to PATRON or LIBRARIAN.
- Genre: Stores book categories. Each genre has a unique name.
- Book: Stores book details, including title, author, and available copies.

### Why Book References Genre

The Book model references Genre through a `genreId` foreign key instead of embedding genre information directly in each book record.

This design follows relational database normalization principles. A genre is stored once and can be associated with multiple books through a one-to-many relationship.

This approach:
- Reduces data duplication.
- Maintains referential integrity through foreign keys.
- Makes genre updates easier because a genre name only needs to be changed once.
- Allows efficient querying of books alongside their associated genres.

### Prisma and Relational Modeling

Unlike a document database where related information can be embedded inside documents, Prisma models relationships explicitly using foreign keys and relation fields. This makes relationships and data consistency easier to manage in a relational database.