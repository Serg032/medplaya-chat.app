import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

/**
 * @title Basic expansion panel
 */
@Component({
  selector: 'expansion-panel',
  templateUrl: 'expansion-panel.component.html',
  standalone: true,
  imports: [MatExpansionModule, MatIconModule],
})
export class ExpansionPanel {
  panelOpenState = false;
}
