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
import { ActivatedRoute, Router } from '@angular/router';
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
  Message,
  MessageService,
} from '../services/message.service';

interface ChatMessage {
  author: string;
  message: string;
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
  private accessToken = 'accessToken';

  recognition: any;
  recognizedText: string = '';

  public messageHour = new Date().getHours();

  constructor(
    private router: ActivatedRoute,
    private routerNavigator: Router,
    private userService: UserService,
    private conversationService: ConversationService,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
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

          const guest = this.guest;
          guest
            ? this.userService.validateAuth(
                guest,
                localStorage.getItem(this.accessToken) as string
              )
            : this.routerNavigator.navigate(['']);

          this.createConversationFunction = async () => {
            await this.conversationService.create({
              guestId: this.guestId!,
            });

            this.conversations = await this.conversationService.getByGuestId(
              this.guestId!
            );

            this.currentConversation = this.getLastConversation();

            if (this.currentConversation) {
              this.updateCurrentConversation(this.currentConversation);
            }
          };

          this.conversations = await this.conversationService.getByGuestId(
            this.guestId
          );

          this.currentConversation = this.getLastConversation();

          if (this.currentConversation) {
            await this.getMessagesFromConversation();
          }
        } else {
          this.routerNavigator.navigate(['']);
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

  public async updateCurrentConversation(convesation: ConversationByQuery) {
    this.currentConversation = convesation;
    await this.getMessagesFromConversation();
  }

  public async sendMessage() {
    if (!this.currentConversation) {
      await this.createConversationFunction();

      await this.sendMessageOperative(this.messageInput.value);
      return;
    }
    await this.sendMessageOperative(this.messageInput.value);
  }

  private buildChatMessage(
    author: messageAuthor,
    message: string
  ): ChatMessage {
    return {
      author,
      message,
    };
  }

  private buildCreateMessageCommand(
    conversationId: string,
    question: string,
    chatResponse: string
  ): CreateMessageCommand {
    let customChatResponse;
    let customQuestion;

    return {
      id: crypto.randomUUID(),
      question: customQuestion ? customQuestion : question,
      chatResponse: customChatResponse ? customChatResponse : chatResponse,
      conversationId: conversationId,
    };
  }

  private async getMessagesFromConversation() {
    if (!this.currentConversation) {
      return;
    } else {
      this.chatMessages = [];

      const allMessagesByConversation =
        await this.messageService.getMessagesByConversationId({
          query: {
            where: {
              conversationId: this.currentConversation.id,
            },
          },
        });

      if (allMessagesByConversation && allMessagesByConversation?.length > 0) {
        allMessagesByConversation.map((message) => {
          const databaseMessageToChatMessage =
            this.buildChatMessageFromDatabaseMessage(message);
          this.chatMessages.push(databaseMessageToChatMessage.question);
          this.chatMessages.push(databaseMessageToChatMessage.response);
        });
      }
    }
  }

  private buildChatMessageFromDatabaseMessage(databaseMessage: Message): {
    question: ChatMessage;
    response: ChatMessage;
  } {
    return {
      question: this.buildChatMessage('user', databaseMessage.question),
      response: this.buildChatMessage('chat-gpt', databaseMessage.chatResponse),
    };
  }

  private async sendMessageOperative(guestQuestion: string) {
    console.log('Input at operative', guestQuestion);
    this.chatMessages.push(this.buildChatMessage('user', guestQuestion));
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
    this.messageInput.setValue('');
    this.showSpinner = true;

    const chatResponse: ChatResponse | undefined =
      await this.messageService.sendQuestionToAssistant(guestQuestion);

    if (chatResponse?.chatMessage && this.currentConversation) {
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

  public async buildConversationTitle(conversationId: string): Promise<string> {
    const converstaionMessages =
      await this.messageService.getMessagesByConversationId({
        query: {
          where: {
            conversationId,
          },
        },
      });

    if (converstaionMessages && converstaionMessages.length > 0) {
      return converstaionMessages[0].question;
    } else {
      return 'Still no message';
    }
  }

  public async deleteConversation(conversationId: string) {
    await this.conversationService.deleteById(conversationId);
    this.guestId
      ? (this.conversations = await this.conversationService.getByGuestId(
          this.guestId
        ))
      : this.routerNavigator.navigate(['']);
    this.currentConversation = this.getLastConversation();
    this.chatMessages = [];
    if (this.currentConversation) {
      this.updateCurrentConversation(this.currentConversation);
    } else {
      this.currentConversation = undefined;
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  public logout() {
    localStorage.removeItem(this.accessToken);
    this.routerNavigator.navigate(['']);
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
