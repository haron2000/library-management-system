import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()

export class GenresService {
    constructor(private prisma: PrismaService) {}
    findAll() {
        return this.prisma.genre.findMany();
    }
    
    async findOne(id: number) {
        const genre = await this.prisma.genre.findUnique({
            where: { id },
        });
        if (!genre) {
            throw new NotFoundException(`Genre with ID ${id} not found`);
        }
        return genre;
    }

    create(name: string) {
        return this.prisma.genre.create({
            data: { name },
        });
    }

    async update(id: number, name: string) {
        const genre = await this.prisma.genre.findUnique({
            where: { id },
        });
        if (!genre) {
            throw new NotFoundException(`Genre with ID ${id} not found`);
        }
        return this.prisma.genre.update({
            where: { id },
            data: { name },
        });
    }

    async remove(id: number) {
        const genre = await this.prisma.genre.findUnique({
            where: { id },
        });
        if (!genre) {
            throw new NotFoundException(`Genre with ID ${id} not found`);
        }
        return this.prisma.genre.delete({
            where: { id },
        });
    }
}