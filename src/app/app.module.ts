import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { ConversationService } from './services/conversation.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, CommonModule, MatNativeDateModule],
  providers: [provideAnimationsAsync(), ConversationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
