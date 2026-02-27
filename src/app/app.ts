import { Component, signal } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'cli-root',
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class App {

}
