import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class MessageTxtDto {
  @ApiProperty({
    example: 'Hola Mundo',
    description: 'Es el mensaje que se va a mandar',
  })
  @IsString()
  @MinLength(1)
  message: string;

  @ApiProperty({
    maxLength: 10,
    minLength: 10,
    example: '7771234567',
    description:
      'Número al que se va a mandar el mensaje con lada de la región',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  phoneNumber: string;
}
