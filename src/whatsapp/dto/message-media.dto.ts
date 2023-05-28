import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import WAWebJS from 'whatsapp-web.js';

export class MessageMediaDto {
  @ApiProperty({
    example:
      '/Users/alejandro/Documents/Temporal/whats-temporal/mediaSend/trim.mp4',
    description: 'Es el path donde está guardado el archivo',
  })
  @IsString()
  @MinLength(1)
  path: string;

  @ApiProperty({
    maxLength: 10,
    minLength: 10,
    example: '7771234567',
    description:
      'Número al que se va a mandar el archivo con lada de la región',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  phoneNumber: string;

  @ApiProperty({})
  @IsOptional()
  caption?: string;
}
