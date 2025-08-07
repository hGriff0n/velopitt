import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('velopitt');

  book: any = { };

  constructor(http: HttpClient) {
    http.get('https://api.angular.schule/book/9783864906466')
      .subscribe(b => this.book = b);
  }
}
