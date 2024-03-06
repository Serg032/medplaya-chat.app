import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { Spinner } from '../ui/spinner/spinner.component';
import {
  GetUserByIdResponse as GetUserByIdResponse,
  UserService,
} from '../services/user.service';
import {
  ConversationByQuery,
  ConversationService,
} from '../services/conversation.service';
import {
  ChatResponse,
  CreateMessageCommand,
  MessageService,
} from '../services/message.service';

interface ChatMessage {
  author: string;
  message: string;
  hour: string;
}

type messageAuthor = 'user' | 'chat-gpt';

// Asegura que SpeechRecognitionEvent esté disponible globalmente
declare global {
  interface SpeechRecognitionEvent extends Event {
    // Define la estructura de SpeechRecognitionEvent según la especificación
    results: SpeechRecognitionResultList;
  }
}

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    Spinner,
    MatSidenavModule,
    MatCheckboxModule,
  ],
})
export class ChatComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  public messageInput = new FormControl();
  public chatMessages: ChatMessage[] = [];
  private guestId: string | null = null;
  public guest: GetUserByIdResponse | undefined;
  public showSpinner: boolean = false;
  public isFirefox: boolean = false;
  public conversations: ConversationByQuery[] = [];
  public createConversationFunction: any; // Function to create conversation
  public currentConversation: ConversationByQuery | undefined;

  recognition: any;
  recognizedText: string = '';

  public messageHour = new Date().getHours();

  constructor(
    private router: ActivatedRoute,
    private userService: UserService,
    private conversationService: ConversationService,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    console.log(
      await this.messageService.getMessagesByConversationId(
        this.currentConversation?.id!
      )
    );
    this.isFirefox = navigator.userAgent.includes('Firefox');
    if (!this.isFirefox) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.lang = 'es-ES';
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        this.recognizedText = event.results[0][0].transcript;
        this.messageInput.setValue(
          this.messageInput.value + this.recognizedText
        );
      };
    }
    this.router.paramMap
      .pipe(filter((param) => param.has('id')))
      .subscribe(async (param) => {
        this.guestId = param.get('id');
        if (this.guestId !== null) {
          this.guest = await this.userService.getGuestById(this.guestId);
          this.createConversationFunction = async () => {
            await this.conversationService.createConversation({
              guestId: this.guestId!,
            });

            this.conversations =
              await this.conversationService.getConversationsByGuestId(
                this.guestId!
              );

            this.currentConversation = this.getLastConversation();

            console.log('current Conversation', this.currentConversation);
          };
        }
        if (this.guest && this.guestId) {
          const guest = this.guest;
          guest
            ? this.userService.validateAuth(
                guest,
                localStorage.getItem('accessToken') as string
              )
            : console.log('No guest');

          this.conversations =
            await this.conversationService.getConversationsByGuestId(
              this.guestId
            );

          this.currentConversation = this.getLastConversation();
          console.log('current Conversation', this.currentConversation);
        }
      });
  }

  public getLastConversation(): ConversationByQuery | undefined {
    if (this.conversations.length > 0) {
      return this.conversations.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })[0];
    } else {
      return undefined;
    }
  }

  public updateCurrentConversatio(convesation: ConversationByQuery) {
    console.log('Click on a conversation: ', convesation);

    this.currentConversation = convesation;
  }

  public async sendMessage() {
    const guestQuestion = this.messageInput.value;
    this.chatMessages.push(this.buildChatMessage('user', guestQuestion));
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
    this.messageInput.setValue('');
    this.showSpinner = true;

    const chatResponse: ChatResponse | undefined =
      await this.messageService.sendQuestionToAssistant(guestQuestion);

    if (chatResponse?.chatMessage && this.currentConversation) {
      console.log('Chat Response', chatResponse);
      this.chatMessages.push(
        this.buildChatMessage('chat-gpt', chatResponse.chatMessage)
      );

      const createdMessageResponse = await this.messageService.createMessage(
        this.buildCreateMessageCommand(
          this.currentConversation.id,
          guestQuestion,
          chatResponse.chatMessage
        )
      );
      if (createdMessageResponse.statusCode === 201) {
        this.showSpinner = false;
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      }
    } else {
      alert('Something went wrong');
      return;
    }
  }

  private buildChatMessage(
    author: messageAuthor,
    message: string
  ): ChatMessage {
    const rootDate = new Date();
    const hour = rootDate.getHours();
    const minutes =
      rootDate.getMinutes().toString().length === 1
        ? `0${rootDate.getMinutes()}`
        : rootDate.getMinutes();
    const hourString = `${hour.toString()}:${minutes.toString()} `;
    return {
      author,
      message,
      hour: hourString,
    };
  }

  private buildCreateMessageCommand(
    conversationId: string,
    question: string,
    chatResponse: string
  ): CreateMessageCommand {
    let customChatResponse;
    let customQuestion;
    if (chatResponse.length > 255) {
      customChatResponse = chatResponse.slice(0, 200);
    }
    if (question.length > 255) {
      customQuestion = question.slice(0, 200);
    }

    return {
      id: crypto.randomUUID(),
      question: customQuestion ? customQuestion : question,
      chatResponse: customChatResponse ? customChatResponse : chatResponse,
      conversationId: conversationId,
    };
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  startRecognition() {
    this.recognition.start();
  }

  stopRecognition() {
    this.recognition.stop();
  }

  public buildGuestNameDisplay(): string {
    if (this.guest) {
      return this.guest.name + ' ' + this.guest.surname1;
    }

    return 'CloudIA';
  }
}

// public async sendMessage() {
//   try {
//     const userMessage = this.messageInput.value;

//     if (this.guestId && userMessage) {
//       this.scrollToBottom();

//       this.chatMessages.push(this.buildChatMessage('user', userMessage));
// setTimeout(() => {
//   this.scrollToBottom();
// }, 0);
//       this.messageInput.setValue('');
//       this.showSpinner = true;

//       const chatResponse = await fetch('http://localhost:3000', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ message: userMessage }),
//       });
//       if (!chatResponse.ok) {
//         throw new Error('Network response was not ok');
//       }
//       const chatResponseData: ChatResponse = await chatResponse.json();

//       const chatMessage = chatResponseData.chatMessage;
//       const createMessageCommand: CreateMessageCommand =
//         this.buildCreateMessageCommand(
//           this.guestId,
//           userMessage,
//           chatMessage
//         );
//       await this.sendCreatedMessage(createMessageCommand);
//       this.showSpinner = false;
//       this.chatMessages.push(this.buildChatMessage('chat-gpt', chatMessage));
//       setTimeout(() => {
//         this.scrollToBottom();
//       }, 0);
//     } else if (!userMessage) {
//       alert('Theres no message');
//     } else {
//       alert('theres no client id');
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// private async sendCreatedMessage(command: CreateMessageCommand) {
//   return this.messageService.createMessage(command);
// }

// private buildCreateMessageCommand(
//   conversationId: string,
//   question: string,
//   chatResponse: string
// ): CreateMessageCommand {
//   let customChatResponse;
//   let customQuestion;
//   if (chatResponse.length > 255) {
//     customChatResponse = chatResponse.slice(0, 200);
//   }
//   if (question.length > 255) {
//     customQuestion = question.slice(0, 200);
//   }

//   return {
//     id: crypto.randomUUID(),
//     question: customQuestion ? customQuestion : question,
//     chatResponse: customChatResponse ? customChatResponse : chatResponse,
//     conversationId: conversationId,
//   };
// }

// private scrollToBottom(): void {
//   try {
//     this.messagesContainer.nativeElement.scrollTop =
//       this.messagesContainer.nativeElement.scrollHeight;
//   } catch (err) {}
// }
