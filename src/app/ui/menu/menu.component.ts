import { Component } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

/**
 * @title Basic menu
 */
@Component({
  selector: 'custom-menu',
  templateUrl: 'menu.component.html',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule],
})
export class CustomMenu {}
