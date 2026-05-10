import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HighlightPipe } from '../../pipes/highlight.pipe';

interface Note {
  id: number;
  content: string;
  category: string;
  createdAt: string;
  pinned: boolean;
  gistUrl?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, MarkdownComponent, DatePipe, HighlightPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);

  notes = signal<Note[]>([]);
  searchQuery = signal(''); // Signal for search text
  newNote = '';

  // Add a new signal for the active category
  activeCategory = signal<string>('ALL');
  categories = ['ALL', 'ANGULAR', 'SPRING', 'TODO', 'SCRATCHPAD'];

  darkMode = signal(true); // Default to dark mode for devs

  isPreviewMode = signal(false);

  notification = signal<{ message: string; type: 'success' | 'error' } | null>(
    null,
  );

  editingNoteId = signal<number | null>(null);
  editContent = signal<string>('');

  @ViewChild('noteInput') noteInput!: ElementRef;

  filteredNotes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.activeCategory();
    const allNotes = this.notes();

    const filtered = allNotes.filter((note) => {
      const content = (note.content || '').toLowerCase();
      const category = note.category || 'SCRATCHPAD';
      const matchesSearch = query === '' || content.includes(query);
      const matchesCat = cat === 'ALL' || category === cat;
      return matchesSearch && matchesCat;
    });

    // NEW: Sort by Pinned status, then by Date
    return [...filtered].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return a.pinned ? -1 : 1;
    });
  });

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    this.http
      .get<Note[]>('/api/notes')
      .subscribe((data) => this.notes.set(data));
  }

  addNote() {
    const content = this.newNote.trim();
    if (!content) return;

    const payload = {
      content: content,
      category:
        this.activeCategory() === 'ALL' ? 'SCRATCHPAD' : this.activeCategory(),
    };

    this.http.post('/api/notes', payload).subscribe({
      next: () => {
        this.newNote = '';
        this.isPreviewMode.set(false); // Reset to editor view for the next note
        this.loadNotes();
        setTimeout(() => {
          if (this.noteInput) this.noteInput.nativeElement.focus();
        }, 0);
      },
      error: (err) => console.error('Failed to save note', err),
    });
  }

  deleteNote(id: number) {
    // 1. Optimistic Update: Remove from local signal immediately
    this.notes.update((current) => current.filter((n) => n.id !== id));

    // 2. Background Sync: Tell the server
    this.http.delete(`/api/notes/${id}`).subscribe({
      error: () => this.loadNotes(), // Revert on failure
    });
  }

  toggleTheme() {
    this.darkMode.update((v) => !v);
  }

  // Add this method to your class
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Add a brief "Copied!" toast or alert here later
      console.log('Snippet copied to clipboard');
    });
  }

  exportToGist(note: Note) {
    this.http
      .post<{ url: string }>(`/api/notes/${note.id}/export`, {})
      .subscribe({
        next: (response) => {
          // 1. Update the local signal so the button turns green INSTANTLY
          this.notes.update((current) =>
            current.map((n) =>
              n.id === note.id ? { ...n, gistUrl: response.url } : n,
            ),
          );

          this.notification.set({
            message: 'Gist created successfully!',
            type: 'success',
          });

          window.open(response.url, '_blank');

          setTimeout(() => this.notification.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          console.error('GitHub Export failed:', err);
          this.notification.set({
            message: 'GitHub Export failed. Check .env token.',
            type: 'error',
          });
          setTimeout(() => this.notification.set(null), 5000);
        },
      });
  }

  togglePreview() {
    this.isPreviewMode.update((val) => !val);
  }

  togglePin(note: Note) {
    const newStatus = !note.pinned;

    // The second argument is the body: { "pinned": true/false }
    this.http
      .patch<Note>(`/api/notes/${note.id}/pin`, { pinned: newStatus })
      .subscribe({
        next: (updatedNote) => {
          // Update the local note state immediately for a fast UI feel
          this.notes.update((current) =>
            current.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
          );
        },
        error: (err: HttpErrorResponse) => {
          console.error('Pinning failed:', err);
          this.notification.set({
            message: 'Failed to pin note',
            type: 'error',
          });
        },
      });
  }

  handleGistAction(note: Note) {
    if (note.gistUrl) {
      // If it exists, just open it in a new tab on your Mac M2
      window.open(note.gistUrl, '_blank');
    } else {
      // If it doesn't exist, trigger the export process
      this.exportToGist(note);
    }
  }

  startEdit(note: Note) {
    this.editingNoteId.set(note.id);
    this.editContent.set(note.content);
  }

  cancelEdit() {
    this.editingNoteId.set(null);
  }

  saveEdit(note: Note) {
    this.http
      .put<Note>(`/api/notes/${note.id}`, {
        content: this.editContent(),
        category: note.category,
      })
      .subscribe({
        next: (updated) => {
          this.notes.update((current) =>
            current.map((n) => (n.id === updated.id ? updated : n)),
          );
          this.editingNoteId.set(null);
          this.notification.set({ message: 'Note updated!', type: 'success' });
          setTimeout(() => this.notification.set(null), 3000);
        },
      });
  }
}
