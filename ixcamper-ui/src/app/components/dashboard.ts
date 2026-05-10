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
import { HighlightPipe } from '../pipes/highlight.pipe';

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
  template: `
    <div [class.dark-mode]="darkMode()" class="theme-wrapper">
      @if (notification()) {
        <div
          class="notification-toast"
          [class]="'toast-' + notification()?.type"
        >
          {{ notification()?.message }}
        </div>
      }
      <div class="scribe-container">
        <header>
          <h1>Ixcamper Scribe</h1>
          <button (click)="toggleTheme()" class="theme-toggle">
            {{ darkMode() ? '☀️ Light' : '🌙 Dark' }}
          </button>
          <input
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            class="search-bar"
            placeholder="Search notes (e.g. 'Spring Boot' or 'Angular')..."
          />
        </header>

        <div class="input-section">
          <div class="input-header">
            <button (click)="togglePreview()" class="btn-secondary">
              {{ isPreviewMode() ? '✍️ Edit' : '👁️ Preview' }}
            </button>
          </div>

          <div class="editor-wrapper" [class.preview-active]="isPreviewMode()">
            <textarea
              #noteInput
              [(ngModel)]="newNote"
              placeholder="Write in Markdown (e.g. # TODO)..."
              class="editor-textarea"
            ></textarea>

            <div class="markdown-preview-area">
              <markdown [data]="newNote"></markdown>
            </div>
          </div>

          <button (click)="addNote()" class="btn-primary">Scribe It</button>
        </div>

        <div class="category-bar">
          @for (cat of categories; track cat) {
            <button
              [class.active]="activeCategory() === cat"
              (click)="activeCategory.set(cat)"
            >
              {{ cat }}
            </button>
          }
        </div>

        <div class="notes-list">
          @for (note of filteredNotes(); track note.id) {
            <div class="note-card">
              <div class="note-header">
                <div class="left-meta">
                  <span class="badge">{{ note.category }}</span>
                  <button
                    (click)="togglePin(note)"
                    class="btn-pin"
                    [class.is-pinned]="note.pinned"
                    [title]="note.pinned ? 'Unpin Note' : 'Pin Note'"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="12" y1="17" x2="12" y2="22"></line>
                      <path
                        d="M5 17h14v-2l-1.5-1.5V5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v8.5L5 15v2z"
                      ></path>
                    </svg>
                  </button>
                  @if (note.gistUrl) {
                    <a
                      [href]="note.gistUrl"
                      target="_blank"
                      class="sync-indicator"
                      title="View on GitHub"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                        ></path>
                      </svg>
                    </a>
                  }
                </div>
                <span class="timestamp">{{
                  note.createdAt
                    ? (note.createdAt | date: 'MMM dd, HH:mm')
                    : 'Draft'
                }}</span>
              </div>

              <div class="note-content">
                <markdown
                  [data]="note.content | highlight: searchQuery()"
                ></markdown>
              </div>

              <div class="note-actions">
                <!-- Gist Export Button -->
                <button
                  (click)="handleGistAction(note)"
                  class="btn-icon"
                  [class.is-synced]="note.gistUrl"
                  [title]="note.gistUrl ? 'View on GitHub' : 'Export to Gist'"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                    ></path>
                  </svg>
                </button>

                <!-- Optional: Delete Button (also kept small) -->
                <button
                  (click)="deleteNote(note.id)"
                  class="btn-icon delete-hover"
                  title="Delete Note"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>No notes found matching "{{ searchQuery() }}"</p>
              <button (click)="searchQuery.set('')">Clear Search</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    /* Update the Theme Wrapper variables */
    .theme-wrapper.dark-mode {
      --bg-color: #0f172a;
      --text-color: #f8fafc; /* This ensures content is off-white */
      --card-bg: #1e293b;
      --border-color: #334155;
      --muted-text: #94a3b8; /* Specific color for timestamps in dark mode */
    }

    .theme-wrapper {
      --bg-color: #f8fafc;
      --text-color: #0f172a;
      --card-bg: #ffffff;
      --border-color: #e2e8f0;
      --muted-text: #64748b; /* Specific color for timestamps in light mode */

      background-color: var(--bg-color);
      color: var(--text-color);
      height: 100vh;
    }

    .scribe-container {
      max-width: 800px;
      margin: auto;
      padding: 2rem;
      font-family: 'Inter', sans-serif;
    }
    .theme-toggle {
      margin-bottom: 1rem;
    }
    .search-bar {
      width: 97%;
      padding: 12px;
      margin-bottom: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
      background: #f9f9f9;
    }
    textarea {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #ddd;
      font-family: monospace;
    }

    .note-card {
      display: flex;
      flex-direction: column;
      height: 100%; /* Important: Card fills the height of the row's tallest item */

      /* REMOVED: margin-bottom: 1rem; - Grid gap handles this now */

      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      color: var(--text-color);
      transition:
        transform 0.2s,
        box-shadow 0.2s;
    }

    button {
      background: #2563eb;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 10px;
    }

    .note-card pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      position: relative;
      cursor: pointer;
    }

    .note-card pre::after {
      content: 'Click to copy';
      position: absolute;
      top: 5px;
      right: 10px;
      font-size: 0.7rem;
      opacity: 0;
      transition: opacity 0.2s;
      color: #9ca3af;
    }

    .note-card pre:hover::after {
      opacity: 1;
    }

    .category-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap; /* Good for mobile/narrow views */
    }

    .category-bar button {
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;

      /* The Fix: Use variables so it adapts to Dark/Light mode */
      background-color: var(--card-bg);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      font-weight: 500;
    }

    /* Hover state for better UX */
    .category-bar button:hover {
      border-color: #2563eb;
      background-color: rgba(37, 99, 235, 0.1);
    }

    /* Active state (The selected category) */
    .category-bar button.active {
      background-color: #2563eb !important; /* Force the blue */
      color: #ffffff !important; /* Force white text */
      border-color: #2563eb;
      align-items: flex-start; /* Keeps the top row aligned */
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
    }

    .note-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 0.8rem;
    }
    .badge {
      background: #e0e7ff;
      color: #4338ca;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: bold;
    }
    .timestamp {
      color: var(
        --muted-text
      ) !important; /* Forces visibility for DatePipe output */
      font-weight: 500;
    }

    .notes-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      /* Forces a clear vertical and horizontal gap between all cards */
      row-gap: 4.5rem;
      column-gap: 1.5rem;
      align-items: stretch;
      margin-top: 2rem; /* Separates the list from the category bar */
      padding-bottom: 4rem;
    }

    .note-content {
      flex: 1; /* Pushes the actions/footer to the very bottom of the card */

      /* REMOVED: max-height: 400px; - This allows the card to grow with the content */

      overflow: visible; /* Let the content define the height */
      margin-bottom: 1.5rem;
      color: var(--text-color);
    }

    /* Custom scrollbar for a cleaner Mac M2 look */
    .note-content::-webkit-scrollbar {
      width: 4px;
    }
    .note-content::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 10px;
    }

    /* Ensure code blocks have high contrast regardless of theme */
    .note-content pre {
      background-color: #1e1e1e !important; /* Darker background for code */
      color: #d1d5db !important;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      margin: 1rem 0;
      overflow-x: auto;
    }

    .note-content markdown {
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .note-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: var(--bg-color);
      padding-bottom: 10px;
      border-bottom: 2px solid var(--border-color);
    }

    .input-section {
      position: sticky;
      top: 80px; /* Below the header */
      z-index: 99;
      background-color: var(--bg-color);
      padding: 15px 0;
    }

    .empty-state {
      grid-column: 1 / -1; /* Spans the full grid width */
      text-align: center;
      padding: 4rem;
      color: var(--muted-text);
      border: 2px dashed var(--border-color);
      border-radius: 12px;
    }

    .notification-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }

    .toast-success {
      background-color: #10b981;
    }
    .toast-error {
      background-color: #ef4444;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Container for note-level actions */
    .note-actions {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: 12px;
    }

    /* Specific styling for the Gist/Icon button */
    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px; /* Fixed small size */
      height: 32px; /* Fixed small size */
      padding: 0; /* Remove inherited padding */
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--card-bg);
      color: var(--muted-text);
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      color: var(--accent-color);
      border-color: var(--accent-color);
      background: rgba(37, 99, 235, 0.05); /* Light blue tint */
    }

    /* Ensure the SVG inside stays proportional */
    .btn-icon svg {
      width: 18px;
      height: 18px;
    }

    /* Container for the Editor + Preview */
    .editor-wrapper {
      position: relative;
      min-height: 200px;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: var(--card-bg);
      margin-top: 10px;
    }

    /* Visibility Logic */
    .editor-textarea {
      display: block;
      width: 100%;
      min-height: 200px;
      padding: 12px;
      border: none;
      font-family: 'Fira Code', monospace;
      resize: vertical;
      background: transparent;
      color: var(--text-color);
    }

    .markdown-preview-area {
      display: none; /* Hidden by default */
      padding: 12px;
      min-height: 200px;
      background: var(--card-bg);
      color: var(--text-color);
      overflow-y: auto;
    }

    /* Toggle State: When preview is active */
    .preview-active .editor-textarea {
      display: none;
    }

    .preview-active .markdown-preview-area {
      display: block;
    }

    /* Header for the input actions */
    .input-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: -5px;
    }

    .btn-secondary {
      background: transparent;
      color: var(--accent-color);
      border: 1px solid var(--accent-color);
      padding: 4px 12px;
      font-size: 0.8rem;
      margin: 0;
    }

    /* Refined Pin Button */
    .btn-pin {
      background: transparent;
      border: none;
      padding: 4px;
      margin-left: 8px;
      cursor: pointer;
      color: var(--muted-text);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 0; /* Override your general button margin-top */
    }

    .btn-pin svg {
      width: 16px;
      height: 16px;
    }

    .btn-pin:hover {
      color: var(--accent-color);
      transform: scale(1.1);
    }

    /* Pinned State: Tilted and Red/Orange */
    .btn-pin.is-pinned {
      color: #ef4444; /* Standard alert/pin red */
      transform: rotate(-45deg);
    }

    .btn-pin.is-pinned svg {
      fill: rgba(239, 68, 68, 0.1); /* Subtle internal fill */
    }

    /* Ensure the header meta aligns icons properly */
    .left-meta {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sync-indicator {
      color: #10b981; /* Emerald Green */
      display: flex;
      align-items: center;
      margin-left: 8px;
      text-decoration: none;
      transition: transform 0.2s ease;
    }

    .sync-indicator svg {
      width: 14px;
      height: 14px;
    }

    .sync-indicator:hover {
      transform: scale(1.2);
      color: #34d399;
    }

    /* Synced State for Gist Button */
    .btn-icon.is-synced {
      color: #10b981;
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .btn-icon.is-synced:hover {
      background: rgba(16, 185, 129, 0.2);
      transform: scale(1.05);
    }

    /* Search Highlight Styles */
    ::ng-deep .search-highlight {
      background-color: rgba(255, 222, 33, 0.4); /* Subtle yellow glow */
      color: inherit;
      padding: 0 2px;
      border-radius: 2px;
      font-weight: 600;
      border-bottom: 2px solid #eab308; /* Bright yellow underline */
    }

    .dark-mode ::ng-deep .search-highlight {
      background-color: rgba(234, 179, 8, 0.3); /* Darker gold for dark mode */
      color: #fde047;
      border-bottom-color: #fde047;
    }
  `,
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
}
