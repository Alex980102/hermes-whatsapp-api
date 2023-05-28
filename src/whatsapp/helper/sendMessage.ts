import axios, { AxiosResponse } from 'axios';
import { Client, MessageMedia } from 'whatsapp-web.js';
import { MessengerCreateResponse } from '../whatsapp.service';
import { validNumber } from './validNumber';

export const sendMessageApi = async (
  client: Client,
  number: number,
  message: string,
) => {
  const _validNumber = await validNumber(client, number);
  if (_validNumber) {
    const _send = await client.sendMessage(
      `521${number}@c.us`,
      message,
    );
    console.log(_send);
    // TODO: Gurdar mensaje en la base de datos
    const userId = await axios.get(
      `${process.env.MAIN_URL}/api/user/botmessage/${
        _send.to.split('@')[0]
      }`,
    );

    const _messengerId:AxiosResponse<MessengerCreateResponse> = await axios.get(
      `${process.env.MAIN_URL}/api/messenger/${
        _send.from.split('@')[0]
      }`,
    );
    const messageDB = {
      from: _messengerId.data.msg,
      to: await userId.data.msg,
      hasMedia: _send.hasMedia,
      type: _send.type,
      sendFromBot: true,
      body: _send.body,
      whatsData: _send
    };
    const _createMessage = await axios.post(`${process.env.MAIN_URL}/api/message/`, messageDB)

    const respuesta = {
      ok: true,
      msg: 'Mensaje envido',
      status: 200,
    };
    return respuesta;
  } else {
    const respuesta = {
      ok: false,
      msg: 'El número no es un usuario válido de whatsapp',
      status: 404,
    };
    return respuesta;
  }
};

export const sendFileApi = async (
  client: Client,
  number: number,
  path: string,
  caption: string,
) => {
  const _validNumber = await validNumber(client, number);
  if (_validNumber) {
    const file = path;
    try {
      const media = MessageMedia.fromFilePath(file);
      const _send = await client.sendMessage(`521${number}@c.us`, media, { caption: caption });
      console.log(_send);
      const userId = await axios.get(
        `${process.env.MAIN_URL}/api/user/botmessage/${
          _send.to.split('@')[0]
        }`,
      );
      const _messengerId:AxiosResponse<MessengerCreateResponse> = await axios.get(
        `${process.env.MAIN_URL}/api/messenger/${
          _send.from.split('@')[0]
        }`,
      );
      const messageDB = {
        from: _messengerId.data.msg,
        to: await userId.data.msg,
        hasMedia: _send.hasMedia,
        type: _send.type,
        sendFromBot: true,
        body: _send.body,
        whatsData: _send
      };
      const _createMessage = await axios.post(`${process.env.MAIN_URL}/api/message/`, messageDB)
      console.log(_createMessage);
      console.log(messageDB);
      const respuesta = {
        ok: true,
        msg: 'Mensaje enviado',
        status: 200,
      };
      return respuesta;
    } catch (error) {
      console.log(error);
      const respuesta = {
        ok: true,
        msg: 'No se encontro el archivo',
        status: 404,
      };
      return respuesta;
    }
  } else {
    const respuesta = {
      ok: false,
      msg: 'El número no es un usuario de whatsapp válido',
      status: 404,
    };
    return respuesta;
  }
};
