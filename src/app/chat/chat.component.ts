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
  MessageService,
} from '../services/message.service';
import { DataApiService } from '../services/data-api.service';

interface ChatMessage {
  author: string;
  message: string;
}

type messageAuthor = 'user' | 'chat-gpt';

type SupporttedLanguages = 'en-US' | 'es-ES' | 'gl-ES' | 'ca-ES';

interface LocalStorageConversation {
  id: string;
  guestId: string;
  createdAt: number;
}

interface LocalStorageConversations {
  conversations: LocalStorageConversation[];
}

interface LocalStoragMessage {
  id: string;
  question: string;
  chatResponse: string;
  conversationId: string;
  createdAt: string;
}

interface LocalStoragMessages {
  messages: LocalStoragMessage[];
}

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
  public databaseConversations: ConversationByQuery[] = [];
  public localStorageConversations: LocalStorageConversation[] = [];
  public createConversationFunction: any; // Function to create conversation
  public currentDatabaseConversation: ConversationByQuery | undefined;
  public currentLocalStorageConversation: LocalStorageConversation | undefined;
  private accessToken = 'accessToken';
  private conversationsLocalStorageKey = 'conversations';
  private messagesLocalStorageKey = 'messages';

  recognition: any;
  recognizedText: string = '';

  public messageHour = new Date().getHours();

  constructor(
    private router: ActivatedRoute,
    private routerNavigator: Router,
    private userService: UserService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private dataApiService: DataApiService
  ) {}

  async ngOnInit() {
    this.isFirefox = navigator.userAgent.includes('Firefox');
    if (!this.isFirefox) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        this.recognizedText = event.results[0][0].transcript;
        this.messageInput.setValue(this.recognizedText);
        this.messageInput.setValue(this.recognizedText);
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

            this.createLocalStorageConversation(this.guestId!);

            this.databaseConversations =
              await this.conversationService.getByGuestId(this.guestId!);

            this.localStorageConversations =
              this.getLocalStorageConversations();

            this.currentDatabaseConversation =
              this.getLastDatabaseConversation();

            this.currentLocalStorageConversation =
              this.getLastLocalStorageConversation();

            if (this.currentDatabaseConversation) {
              this.updateDatabaseCurrentConversation(
                this.currentDatabaseConversation
              );
            }

            if (this.currentLocalStorageConversation) {
              this.updateLocalStorageCurrentConversation(
                this.currentLocalStorageConversation
              );
            }
          };

          this.localStorageConversations = this.getLocalStorageConversations();

          this.currentLocalStorageConversation =
            this.getLastLocalStorageConversation();

          this.databaseConversations =
            await this.conversationService.getByGuestId(this.guestId);

          this.currentDatabaseConversation = this.getLastDatabaseConversation();

          this.currentLocalStorageConversation =
            this.getLastLocalStorageConversation();

          if (this.currentLocalStorageConversation) {
            await this.getLocalStorageMessagesFromConversation();
          }
        } else {
          this.routerNavigator.navigate(['']);
        }
      });
  }

  public getLastDatabaseConversation(): ConversationByQuery | undefined {
    if (this.databaseConversations.length > 0) {
      return this.databaseConversations.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })[0];
    } else {
      return undefined;
    }
  }

  public getLastLocalStorageConversation():
    | LocalStorageConversation
    | undefined {
    if (this.localStorageConversations.length > 0) {
      return this.localStorageConversations.sort((a, b) => {
        return b.createdAt - a.createdAt;
      })[0];
    } else {
      return undefined;
    }
  }

  public async updateDatabaseCurrentConversation(
    conversation: ConversationByQuery
  ) {
    this.currentDatabaseConversation = conversation;
  }

  public async updateLocalStorageCurrentConversation(
    conversation: LocalStorageConversation
  ) {
    this.currentLocalStorageConversation = conversation;
    await this.getLocalStorageMessagesFromConversation();
  }

  public async sendMessage() {
    if (!this.currentLocalStorageConversation) {
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
      message: `<span>${message}</span>`,
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
      question: customQuestion ? customQuestion : question,
      chatResponse: customChatResponse ? customChatResponse : chatResponse,
      conversationId: conversationId,
    };
  }

  private async getLocalStorageMessagesFromConversation() {
    if (!this.currentLocalStorageConversation) {
      return;
    } else {
      this.chatMessages = [];

      const allMessagesByConversation =
        this.getLocalStorageMessagesByConversationId(
          this.currentLocalStorageConversation.id
        );

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

  private buildChatMessageFromDatabaseMessage(
    databaseMessage: LocalStoragMessage
  ): {
    question: ChatMessage;
    response: ChatMessage;
  } {
    return {
      question: this.buildChatMessage('user', databaseMessage.question),
      response: this.buildChatMessage(
        'chat-gpt',
        this.dataApiService.buildResponse(databaseMessage.chatResponse)
      ),
    };
  }

  private async sendMessageOperative(guestQuestion: string) {
    if (
      guestQuestion === null ||
      guestQuestion === undefined ||
      guestQuestion === ''
    ) {
      alert("Can't send an empty message");
      return;
    }
    this.chatMessages.push(this.buildChatMessage('user', guestQuestion));
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
    this.messageInput.setValue('');
    this.showSpinner = true;

    const chatResponse: string | undefined =
      await this.dataApiService.makeQuestion(guestQuestion);

    if (
      chatResponse &&
      this.currentDatabaseConversation &&
      this.currentLocalStorageConversation
    ) {
      // this.chatMessages.push(this.buildChatMessage('chat-gpt', chatResponse));
      this.chatMessages.push(
        this.buildChatMessage(
          'chat-gpt',
          this.dataApiService.buildResponse(chatResponse)
        )
      );

      const createdMessageResponse = await this.messageService.createMessage(
        this.buildCreateMessageCommand(
          this.currentDatabaseConversation.id,
          guestQuestion,
          chatResponse
        )
      );

      if (createdMessageResponse.statusCode === 201) {
        this.showSpinner = false;
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);

        this.createLocalStorageMessage(
          this.currentLocalStorageConversation.id,
          guestQuestion,
          chatResponse
        );
      }
    } else {
      alert('Something went wrong');
      return;
    }
  }

  public buildConversationTitle(conversationId?: string): string {
    const localStorageMessages = localStorage.getItem(
      this.messagesLocalStorageKey
    );
    if (localStorageMessages) {
      const parsedMessages = JSON.parse(
        localStorageMessages
      ) as LocalStoragMessages;
      const messagesByConversationId = parsedMessages.messages.filter(
        (message) => message.conversationId === conversationId
      );
      if (messagesByConversationId && messagesByConversationId.length > 0) {
        const firstMessage = this.getFirstMessageByConversation(
          messagesByConversationId
        );

        return firstMessage.question.slice(0, 10).concat('...');
      }
    }
    return 'custom title';
  }

  private getFirstMessageByConversation(
    messages: LocalStoragMessage[]
  ): LocalStoragMessage {
    messages.sort((a, b) => {
      if (a.createdAt > b.createdAt) {
        return 1;
      } else if (a.createdAt < b.createdAt) {
        return -1;
      }
      return 0;
    });
    return messages[0];
  }

  public async deleteConversation(conversationId: string) {
    this.deleteLocalStorageMessagesByLocalStorageConversationId(conversationId);
    this.deleteLocalStorageConversation(conversationId);

    this.guestId
      ? (this.localStorageConversations = this.getLocalStorageConversations())
      : this.routerNavigator.navigate(['']);
    this.currentLocalStorageConversation =
      this.getLastLocalStorageConversation();
    this.chatMessages = [];
    if (this.currentLocalStorageConversation) {
      this.updateLocalStorageCurrentConversation(
        this.currentLocalStorageConversation
      );
    } else {
      this.currentLocalStorageConversation = undefined;
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

  public changeLanguage(lang: SupporttedLanguages): void {
    if (this.isFirefox) {
      return;
    }
    switch (lang) {
      case 'en-US':
        this.recognition.lang = 'en-US';
        alert('Speech language changed to English');
        break;
      case 'es-ES':
        this.recognition.lang = 'es-ES';
        alert('Speech language changed to Spanish');
        break;
      case 'gl-ES':
        this.recognition.lang = 'gl-ES';
        alert('Speech language changed to Galician');
        break;
      case 'ca-ES':
        this.recognition.lang = 'ca-ES';
        alert('Speech language changed to Catalan');
        break;
      default:
        this.recognition.lang = 'es-ES';
        break;
    }
  }

  private createLocalStorageConversation(guestId: string) {
    const isConversations = localStorage.getItem(
      this.conversationsLocalStorageKey
    );
    if (isConversations) {
      const converstaions: LocalStorageConversations = JSON.parse(
        localStorage.getItem(this.conversationsLocalStorageKey)!
      );
      localStorage.setItem(
        this.conversationsLocalStorageKey,
        JSON.stringify({
          conversations: [
            ...converstaions.conversations,
            this.buildLocalStorageConversation(
              new Date().getTime().toString(),
              guestId
            ),
          ],
        })
      );
      return;
    }

    localStorage.setItem(
      this.conversationsLocalStorageKey,
      JSON.stringify({
        conversations: [
          this.buildLocalStorageConversation(
            new Date().getTime().toString(),
            guestId
          ),
        ],
      })
    );
  }

  private buildLocalStorageConversation(
    id: string,
    guestId: string
  ): LocalStorageConversation {
    return {
      id,
      guestId,
      createdAt: Number(id),
    };
  }

  private getLocalStorageConversations(): LocalStorageConversation[] | [] {
    const isRawConversations = localStorage.getItem(
      this.conversationsLocalStorageKey
    );
    if (isRawConversations) {
      const rawConverstions = JSON.parse(
        isRawConversations
      ) as LocalStorageConversations;
      return rawConverstions.conversations;
    }
    return [];
  }

  private deleteLocalStorageConversation(id: string) {
    const isLocaStorageConversation = localStorage.getItem(
      this.conversationsLocalStorageKey
    );

    if (isLocaStorageConversation) {
      const conversations = JSON.parse(
        isLocaStorageConversation
      ) as LocalStorageConversations;
      const filteredConversations = conversations.conversations.filter(
        (conversation) => conversation.id !== id
      );
      localStorage.setItem(
        this.conversationsLocalStorageKey,
        JSON.stringify(
          this.buildLocalStorageConversations(filteredConversations)
        )
      );
    }
  }

  private buildLocalStorageConversations(
    localStorageConvesations: LocalStorageConversation[]
  ): LocalStorageConversations {
    return {
      conversations: localStorageConvesations,
    };
  }

  private createLocalStorageMessage(
    conversationId: string,
    question: string,
    chatResponse: string
  ) {
    const isLocalStorageMessages = localStorage.getItem(
      this.messagesLocalStorageKey
    );
    if (isLocalStorageMessages) {
      const parsedLocalStorageMessages = JSON.parse(
        isLocalStorageMessages
      ) as LocalStoragMessages;
      const storage: LocalStoragMessages = {
        messages: [
          ...parsedLocalStorageMessages.messages,
          this.buildLocalStorageMessage(conversationId, question, chatResponse),
        ],
      };
      localStorage.setItem(
        this.messagesLocalStorageKey,
        JSON.stringify(storage)
      );
      return;
    }
    localStorage.setItem(
      this.messagesLocalStorageKey,
      JSON.stringify(
        this.buildLocalStorageMessages(conversationId, question, chatResponse)
      )
    );
  }

  private buildLocalStorageMessage(
    conversationId: string,
    question: string,
    chatResponse: string
  ): LocalStoragMessage {
    const timestamp = new Date().getTime().toString();
    return {
      id: timestamp,
      conversationId,
      question,
      chatResponse,
      createdAt: timestamp,
    };
  }

  private buildLocalStorageMessages(
    conversationId: string,
    question: string,
    chatResponse: string
  ): LocalStoragMessages {
    const timestamp = new Date().getTime().toString();
    return {
      messages: [
        {
          id: timestamp,
          conversationId,
          question,
          chatResponse,
          createdAt: timestamp,
        },
      ],
    };
  }

  private getLocalStorageMessagesByConversationId(
    conversationId: string
  ): LocalStoragMessage[] | [] {
    const isLocalStorageMessages = localStorage.getItem(
      this.messagesLocalStorageKey
    );
    if (isLocalStorageMessages) {
      const messagesObject = JSON.parse(
        isLocalStorageMessages
      ) as LocalStoragMessages;
      return messagesObject.messages.filter(
        (message) => message.conversationId === conversationId
      );
    }

    return [];
  }

  private deleteLocalStorageMessagesByLocalStorageConversationId(id: string) {
    const isLocalStorageConversation = localStorage.getItem(
      this.conversationsLocalStorageKey
    );
    const isLocalStorageMessages = localStorage.getItem(
      this.messagesLocalStorageKey
    );
    if (isLocalStorageConversation && isLocalStorageMessages) {
      const parsedMessages = JSON.parse(
        isLocalStorageMessages
      ) as LocalStoragMessages;

      const filteredMessages = parsedMessages.messages.filter(
        (message) => message.conversationId !== id
      );

      const localStorageMessages: LocalStoragMessages = {
        messages: filteredMessages,
      };

      localStorage.setItem(
        this.messagesLocalStorageKey,
        JSON.stringify(localStorageMessages)
      );
    }
  }
}
