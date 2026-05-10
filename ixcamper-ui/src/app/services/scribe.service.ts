import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Note {
  id: string;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ScribeService {
  private http = inject(HttpClient);

  // Signal to hold our list of notes
  notes = signal<Note[]>([]);

  loadNotes() {
    this.http.get<Note[]>('/api/notes').subscribe({
      next: (data) => this.notes.set(data),
      error: (err) => console.error('Failed to load notes', err),
    });
  }
}
