import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { MessageTxtDto } from './dto/message-txt.dto';
import { MessageMediaDto } from './dto/message-media.dto';
import { ApiOperation } from '@nestjs/swagger';
import * as fs from 'fs';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @ApiOperation({ tags: ['QR'] })
  @Get('qr')
  getQr(@Res() res: any) {
    const status = this.whatsappService.status;
    if (!status) {
      res.writeHead(200, { 'content-type': 'image/svg+xml' });
      fs.createReadStream(`${__dirname}/../../public/qr-code.svg`).pipe(res);
    } else {
      res.send('Cliente Logeado');
    }
  }

  @ApiOperation({ tags: ['SendMessages'] })
  @Post('sendtxt')
  createTxt(@Body() messageTxtDto: MessageTxtDto) {
    return this.whatsappService.createMessageTxt(messageTxtDto);
  }

  @ApiOperation({ tags: ['SendMessages'] })
  @Post('sendmedia')
  createMedia(@Body() messageMediaDto: MessageMediaDto) {
    return this.whatsappService.createMessageMedia(messageMediaDto);
  }

  // @Get()
  // findAll() {
  //   return this.whatsappService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.whatsappService.findOne(+id);
  // }
}
