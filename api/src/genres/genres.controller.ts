import { Controller, Get, Param, Post, Body, Patch, Delete } from '@nestjs/common';
import { GenresService } from './genres.service.js';
import { NotFoundException } from '@nestjs/common';

@Controller('genres')
export class GenresController {
  constructor(private genresService: GenresService) {}

  @Get()
  findAll() {
    return this.genresService.findAll();
  }
  @Get(':id')
    findOne(@Param('id') id: string) {
    return this.genresService.findOne(Number(id));
  }
  @Post()
  create(@Body() data: { name: string }) {
    return this.genresService.create(data.name);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: { name: string }
  ) {
    return this.genresService.update(Number(id), data.name);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.genresService.remove(Number(id));
  }
}

