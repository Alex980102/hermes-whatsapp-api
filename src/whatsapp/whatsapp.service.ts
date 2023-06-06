import { Injectable } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { MessageMediaDto } from './dto/message-media.dto';
import { MessageTxtDto } from './dto/message-txt.dto';
import * as fs from 'fs';
import * as qr_svg_api from 'qr-image';
import * as qrcode from 'qrcode-terminal';
import { sendFileApi, sendMessageApi } from './helper/sendMessage';
import axios, { AxiosResponse } from 'axios';
import { connectToServer } from './socket-client';
import * as phone from 'google-libphonenumber';
import * as fsPromise from 'fs/promises';

export interface MessengerCreateResponse {
  ok: boolean;
  msg: string;
}

@Injectable()
export class WhatsappService extends Client {
  status = false;
  constructor() {
    super({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox'],
      },
    });
    this.on('loading_screen', async (percent, message) => {
      await axios.patch(
        `${process.env.MAIN_URL}/api/botprocess/${process.env.BOT_PROCESS_ID}`,
        { status: 'loading_screen' },
      );
      console.log('Cargando pantalla', percent, message);
    });

    this.on('qr', async (qr) => {
      qrcode.generate(qr, { small: true });
      const qr_svg = qr_svg_api.image(qr, { type: 'svg' });
      qr_svg.pipe(
        fs.createWriteStream(`${__dirname}/../../public/qr-code.svg`),
      );
      await axios.patch(
        `${process.env.MAIN_URL}/api/botprocess/${process.env.BOT_PROCESS_ID}`,
        { status: 'qr' },
      );
    });

    this.on('ready', async () => {
      try {
        console.log(this.info.wid.user);
        // Implementar el metodo google phone para extraer el numero del usuario
        const phoneUtil = phone.PhoneNumberUtil.getInstance();
        const _userPhone = phoneUtil.parseAndKeepRawInput(
          this.info.wid.user,
          'MX',
        );
        const _myPhone = phoneUtil.getNationalSignificantNumber(_userPhone);
        console.log(_myPhone);
        this.status = true;
        console.log('Cliente Listo');
        // TODO: GUARDAR EN LA VARIABLE DE ENTORNO LA RESPUESTA DE userId
        const userId: AxiosResponse<MessengerCreateResponse> = await axios.post(
          `${process.env.MAIN_URL}${process.env.CREATE_MESSENGER_URL}`,
          { phone: _myPhone, botProcessId: process.env.BOT_PROCESS_ID },
        );
        await fsPromise.appendFile(
          `${__dirname}/../../.env`,
          `MESSENGERID=${userId.data.msg}`,
        );
        await axios.patch(
          `${process.env.MAIN_URL}${process.env.UPDATE_BOT_PROCESS_URL}/${process.env.BOT_PROCESS_ID}`,
          { status: 'ready' },
        );
        connectToServer();
      } catch (error) {
        console.log('Error On Ready');
        console.log(error);
      }
    });

    // this.on('message_reaction', (reaction) => {
    //   console.log(reaction);
    // });

    this.on('message', async (message) => {
      // TODO: Guradar mensaje en la base de datos
      if (message.from === 'status@broadcast') {
        return;
      }

      // Método para connectarnos con openai

      // let user_id = message.from;
      // console.log(user_id);

      // // Simula que el bot está escribiendo una respuesta
      // const chat = await message.getChat();
      // chat.sendStateTyping();

      // // Envía una solicitud POST a tu API de FastAPI
      // try {
      //   const response = await axios.post(`${process.env.API_URL}/message/`, {
      //     user_id: user_id,
      //     message: message.body,
      //     prompt: process.env.PROMPT
      //   });

      //   // Detiene la simulación de escritura
      //   chat.clearState();

      //   console.log(response.data);

      //   // Envía la respuesta del asistente al cliente de WhatsApp
      //   if (response.data && response.data.message) {
      //     await message.reply(response.data.message);
      //   } else {
      //     console.error("Error al obtener la respuesta del asistente");
      //     await message.reply(
      //       "Error al comunicarse con nuestro asistente me podrías escribir otra vez tu pregunta?"
      //     );
      //   }
      // } catch (error) {
      //   // Detiene la simulación de escritura
      //   chat.clearState();
      //   console.error("Error al comunicarse con la API:", error);
      //   await message.reply(
      //     "Error al comunicarse con nuestro asistente me podrías escribir otra vez tu pregunta?"
      //   );
      // }

      // Método para connectarnos con openai
      
      let user_id = message.from;
      console.log(user_id);

      // Simula que el bot está escribiendo una respuesta
      const chat = await message.getChat();
      chat.sendStateTyping();
      await message.reply("Hola, como estas?");

      // Métodos para guardar mensaje entrante en la base de datos

      const _send = message;
      console.log('---------------Message------------------');
      // console.log(_send);
      // console.log(_send.from.split('@')[0]);
      console.log('---------------Message------------------');
      const userId: AxiosResponse<MessengerCreateResponse> = await axios.get(
        `${process.env.MAIN_URL}/api/user/botmessage/${_send.from.split('@')[0]
        }`,
      );
      console.log(_send.to.split('@')[0]);

      const _messengerId: AxiosResponse<MessengerCreateResponse> =
        await axios.get(
          `${process.env.MAIN_URL}/api/messenger/${_send.to.split('@')[0]}`,
        );

      console.log(userId);
      console.log(
        '----------------------------messengerid-----------------------------',
      );
      console.log(process.env.MESSENGERID);
      console.log(
        '----------------------------messengerid-----------------------------',
      );

      const messageDB = {
        from: userId.data.msg,
        to: _messengerId.data.msg,
        hasMedia: _send.hasMedia,
        type: _send.type,
        sendFromBot: false,
        body: _send.body,
        whatsData: _send,
      };
      console.log(
        '----------------------------messengerdbobject-----------------------------',
      );
      console.log(messageDB);
      console.log(
        '----------------------------messengerdbobject-----------------------------',
      );
      try {
        const _createMessage = await axios.post(
          `${process.env.MAIN_URL}/api/message/`,
          messageDB,
        );
      } catch (error) {
        console.log('Error On Message');
        console.log(error);
      }
    });

    this.on('disconnected', async (msg) => {
      const phoneUtil = phone.PhoneNumberUtil.getInstance();
      const _userPhone = phoneUtil.parseAndKeepRawInput(
        this.info.wid.user,
        'MX',
      );
      const _myPhone = phoneUtil.getNationalSignificantNumber(_userPhone);
      const _messengerId = await axios.get(
        `${process.env.MAIN_URL}/api/messenger/${_myPhone}`,
      );
      console.log(_messengerId.data.user.botProcessId);

      await axios.delete(
        `${process.env.MAIN_URL}/api/botprocess/removepm2/${_messengerId.data.user.botProcessId}`,
      );
      console.log('Cliente desconectado', msg);
    });
    this.initialize();
  }

  async createMessageTxt(messageTxtDto: MessageTxtDto) {
    const phoneNumber = parseInt(messageTxtDto.phoneNumber);
    const message = messageTxtDto.message;

    const send = await sendMessageApi(this, phoneNumber, message);
    console.log(
      '--------------------------------SendMessageText----------------------------------',
    );
    console.log(send['status']);
    console.log(
      '--------------------------------SendMessageText----------------------------------',
    );

    return { ok: send['ok'], msg: send['msg'], status: send['status'] };
  }

  async createMessageMedia(messageMediaDto: MessageMediaDto) {
    const phoneNumber = parseInt(messageMediaDto.phoneNumber);
    const path = messageMediaDto.path;
    const caption = messageMediaDto.caption;

    const send = await sendFileApi(this, phoneNumber, path, caption);
    return { ok: send['ok'], msg: send['msg'], status: send['status'] };
  }
}
