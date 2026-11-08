import { Injectable } from "@nestjs/common";

@Injectable()
export class BooksService {
  private books = [
    {
      id: 1,
      title: "Clean Code",
      author: "Robert C. Martin",
      availableCopies: 5,
    },
    {
      id: 2,
      title: "Atomic Habits",
      author: "James Clear",
      availableCopies: 3,
    },
    {
      id: 3,
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt",
      availableCopies: 7,
    },
  ];

  findAll() {
    return this.books;
  }
  findOne(id: number) {
    return this.books.find((book) => book.id === id);
  }
}
