import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConversationByQuery } from '../../services/conversation.service';
import { CommonModule } from '@angular/common';

/** @title Drawer with explicit backdrop setting */
@Component({
  selector: 'drawer',
  templateUrl: 'drawer.component.html',
  styleUrl: 'drawer.component.css',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    CommonModule,
  ],
})
export class DrawerComponent {
  @Input() guestName: string | undefined;
  @Input() conversations: ConversationByQuery[];
  @Input() createConversation: any;
  @Input() changeCurrentConversation: any;

  constructor() {
    this.guestName = '';
    this.conversations = [];
    this.createConversation = async () => {};
    this.changeCurrentConversation = () => {};
  }
}
