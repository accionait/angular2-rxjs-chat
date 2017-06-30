/* tslint:disable:max-line-length */
import { User } from '../user/user.model';
import { Thread } from '../thread/thread.model';
import { Message } from '../message/message.model';
import { MessagesService } from '../message/messages.service';
import { ThreadsService } from '../thread/threads.service';
import { userServiceInjectables, UsersService } from '../user/users.service';
import { ApiAiClient } from 'api-ai-javascript';
import { IRequestOptions, IServerResponse, ApiAiConstants } from "api-ai-javascript";
import * as moment from 'moment';

// seteo de la persona como Mauro Herlein
const lang = ApiAiConstants.AVAILABLE_LANGUAGES.ES;
 

// const client = new ApiAiClient({accessToken: 'f1bb60857ac24ac5b28c2a3d331007d1'})
// .textRequest('Hello!')
//     .then((response) => {console.log(response);})
//   .catch((error) => {console.log(error)});

// console.log("prueba cliente" + client.then((Response) => {}).catch((error) => {}));

const me: User      = new User('Mauro Herlein', 'assets/images/avatars/mauro-herlein.jpg');
const ladycap: User = new User('Lady Capulet', 'assets/images/avatars/female-avatar-2.png');
const echo: User    = new User('Echo Bot', 'assets/images/avatars/male-avatar-1.png');
const rev: User     = new User('Reverse Bot', 'assets/images/avatars/female-avatar-4.png');
const wait: User    = new User('Waiting Bot', 'assets/images/avatars/male-avatar-2.png');
const help: User = new User('Asistente Virtual', 'assets/images/avatars/male-avatar-3.png');

const tLadycap: Thread = new Thread('tLadycap', ladycap.name, ladycap.avatarSrc);
const tEcho: Thread    = new Thread('tEcho', echo.name, echo.avatarSrc);
const tRev: Thread     = new Thread('tRev', rev.name, rev.avatarSrc);
const tWait: Thread    = new Thread('tWait', wait.name, wait.avatarSrc);
const tHelp: Thread = new Thread('tHelp', help.name, help.avatarSrc);

const initialMessages: Array<Message> = [
  new Message({
    author: me,
    sentAt: moment().subtract(45, 'minutes').toDate(),
    text: 'Yet let me weep for such a feeling loss.',
    thread: tLadycap
  }),
  new Message({
    author: ladycap,
    sentAt: moment().subtract(20, 'minutes').toDate(),
    text: 'So shall you feel the loss, but not the friend which you weep for.',
    thread: tLadycap
  }),
  new Message({
    author: echo,
    sentAt: moment().subtract(1, 'minutes').toDate(),
    text: `I\'ll echo whatever you send me`,
    thread: tEcho
  }),
  new Message({
    author: rev,
    sentAt: moment().subtract(3, 'minutes').toDate(),
    text: `I\'ll reverse whatever you send me`,
    thread: tRev
  }),
  new Message({
    author: wait,  
    sentAt: moment().subtract(4, 'minutes').toDate(),
    text: `I\'ll wait however many seconds you send to me before responding. Try sending '3'`,
    thread: tWait
  }),
  new Message({
    author: help,
    sentAt: moment().subtract(4, 'minutes').toDate(),
    text: `Hola soy un asistente virtual ¿En que puedo ayudarte?`,
    thread: tHelp
  }),
];

export class ChatExampleData {

  private respuesta: '';

  getRespuesta(): string {
    return this.respuesta;
  }

  static init(messagesService: MessagesService,
              threadsService: ThreadsService,
              UsersService: UsersService): void {

    // TODO make `messages` hot
    messagesService.messages.subscribe(() => ({}));

    // set "Mauro" como el usaurio actual
    UsersService.setCurrentUser(me);

    // create the initial messages
    initialMessages.map( (message: Message) => messagesService.addMessage(message) );

    threadsService.setCurrentThread(tEcho);

    this.setupBots(messagesService);
  }

  static setupBots(messagesService: MessagesService): void {

    // echo bot
    messagesService.messagesForThreadUser(tEcho, echo)
      .forEach( (message: Message): void => {
        messagesService.addMessage(
          new Message({
            author: echo,
            text: message.text,
            thread: tEcho
          })
        );
      },
                null);


    // reverse bot
    messagesService.messagesForThreadUser(tRev, rev)
      .forEach( (message: Message): void => {
        messagesService.addMessage(
          new Message({
            author: rev,
            text: message.text.split('').reverse().join(''),
            thread: tRev
          })
        );
      },
                null);

    // waiting bot
    messagesService.messagesForThreadUser(tWait, wait)
      .forEach( (message: Message): void => {

        let waitTime: number = parseInt(message.text, 10);
        let reply: string;

        if (isNaN(waitTime)) {
          waitTime = 0;
          reply = `I didn\'t understand ${message.text}. Try sending me a number`;
        } else {
          reply = `I waited ${waitTime} seconds to send you this.`;
        }

        setTimeout(
          () => {
            messagesService.addMessage(
              new Message({
                author: wait,
                text: reply,
                thread: tWait
              })
            );
          },
          waitTime * 1000);
      },
                null);

  //  Asistente virtual
  messagesService.messagesForThreadUser(tHelp, help)
      .forEach( (message: Message): void => {

        let waitTime: 10;
        var reply: string;
        
        let client = new ApiAiClient({accessToken: 'f1bb60857ac24ac5b28c2a3d331007d1'})
            .textRequest(message.text)
            .then((response) => {
              setTimeout(() => {
                  messagesService.addMessage(
                    new Message({
                      author: help,
                      text: response.result.fulfillment.speech,
                      thread: tHelp
                    })
                  );
                },
                waitTime * 10000);
              })
            .catch((error) => {console.log(error)});
      }, null);


  }

}
