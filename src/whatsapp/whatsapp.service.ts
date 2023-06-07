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
      // await message.reply("Hola, como estas?");

      const text = `The standard Lorem Ipsum passage, used since the 1500s"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
      1914 translation by H. Rackham"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"Section 1.10.33 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."1914 translation by H. Rackham"On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.`;

      const valor1 = Math.floor(Math.random() * (text.length / 2));
      const valor2 = Math.floor(Math.random() * (text.length - valor1)) + valor1;

      const randomText = text.substring(valor1, valor2);

      await message.reply(randomText);


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
