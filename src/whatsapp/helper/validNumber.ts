import { Client } from 'whatsapp-web.js';

export const validNumber = async (client: Client, phoneNumber: number) => {
  const is_valid_number = await client.isRegisteredUser(
    `521${phoneNumber.toString()}`
  );
  if (is_valid_number) {
    return true;
  } else {
    return false;
  }
};

// export const cleanData = async (client: Client, myphoneNumber: any) => {
//   try {
//     // phoneNumber = phoneNumber.replace(/\s+/g, '');
//     const phoneNumber: number = parseInt(myphoneNumber);
//     if (phoneNumber.toString().length != 10) {
//       return {
//         ok: false,
//         msg: `Este numero ${phoneNumber} no tiene el formato permitido`,
//         status: 404,
//       };
//     }
//     const valid_number = await validNumber(client, phoneNumber);
//     if (valid_number) {
//       return {
//         ok: true,
//         number: phoneNumber,
//       };
//     } else {
//       return {
//         ok: false,
//         msg: `Error al verificar el numero, parece que el numero ${phoneNumber} no existe`,
//         status: 404,
//       };
//     }
//   } catch (error) {
//     console.log(error);
//     return {
//       ok: false,
//       msg: 'Error fatal al verificar el numero checar logs',
//       status: 404,
//     };
//   }
// };
