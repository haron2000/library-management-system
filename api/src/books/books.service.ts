
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  // GET: Retrieve books with search, genre filtering and pagination
  async findAll(query: {
    search?: string;
    genreId?: string;
    page?: string;
    limit?: string;
  } = {}) {
    const { search, genreId, page, limit } = query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));

    const parsedGenreId = genreId ? Number(genreId) : undefined;

    if (
      parsedGenreId !== undefined &&
      (!Number.isInteger(parsedGenreId) || parsedGenreId < 1)
    ) {
      throw new BadRequestException('genreId must be a positive integer');
    }

    const where = {
      ...(parsedGenreId !== undefined
        ? { genreId: parsedGenreId }
        : {}),
      ...(search?.trim()
        ? {
            OR: [
              {
                title: {
                  contains: search.trim(),
                  mode: 'insensitive' as const,
                },
              },
              {
                author: {
                  contains: search.trim(),
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        include: { genre: true },
        orderBy: { title: 'asc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data: books,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  // GET: Retrieve one book
  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  // POST: Create a book
  async create(dto: CreateBookDto) {
    const genre = await this.prisma.genre.findUnique({
      where: { id: dto.genreId },
    });

    if (!genre) {
      throw new NotFoundException(
        `Genre with ID ${dto.genreId} not found`,
      );
    }

    return this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        isbn: dto.isbn,
        totalCopies: dto.totalCopies,
        availableCopies: dto.totalCopies,
        genreId: dto.genreId,
      },
      include: { genre: true },
    });
  }

  // PATCH: Update a book
  async update(id: number, dto: Partial<CreateBookDto>) {
    const existingBook = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    if (dto.genreId !== undefined) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: dto.genreId },
      });

      if (!genre) {
        throw new NotFoundException(
          `Genre with ID ${dto.genreId} not found`,
        );
      }
    }

    const updateData: {
      title?: string;
      author?: string;
      isbn?: string;
      totalCopies?: number;
      availableCopies?: number;
      genreId?: number;
    } = { ...dto };

    if (dto.totalCopies !== undefined) {
      const borrowedCopies =
        existingBook.totalCopies - existingBook.availableCopies;

      if (dto.totalCopies < borrowedCopies) {
        throw new BadRequestException(
          'Total copies cannot be less than the number of borrowed copies',
        );
      }

      updateData.availableCopies = dto.totalCopies - borrowedCopies;
    }

    return this.prisma.book.update({
      where: { id },
      data: updateData,
      include: { genre: true },
    });
  }

  // DELETE: Remove a book
  async remove(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return this.prisma.book.delete({
      where: { id },
    });
  }
}
