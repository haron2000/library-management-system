import {
  IsString,
  IsNotEmpty,
  IsISBN,
  IsInt,
  Min,
} from 'class-validator';


export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsISBN('13')
  isbn: string;


  @Min(1)
  @IsInt()
  totalCopies: number;

  @IsInt()
  @Min(1)
  genreId: number;

}