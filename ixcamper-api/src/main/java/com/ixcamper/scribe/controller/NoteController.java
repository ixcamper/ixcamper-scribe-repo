package com.ixcamper.scribe.controller;

import com.ixcamper.scribe.model.Note; // Ensure this import is here
import com.ixcamper.scribe.repository.NoteRepository;
import com.ixcamper.scribe.service.GistService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    
    private final NoteRepository noteRepository;
	private final GistService gistService;

    public NoteController(NoteRepository noteRepository, GistService gistService) {
        this.noteRepository = noteRepository;
        this.gistService = gistService;
    }

    @GetMapping
	public List<Note> getNotes() {
		return noteRepository.findAllByOrderByIdDesc();
	}

    @PostMapping
    public Note createNote(@RequestBody Note note) {
        return noteRepository.save(note);
    }

	@DeleteMapping("/{id}")
	public void deleteNote(@PathVariable Long id) {
		noteRepository.deleteById(id);
	}

	@PostMapping("/{id}/export")
	public ResponseEntity<Map<String, String>> exportNote(@PathVariable Long id) {
		return noteRepository.findById(id)
			.map(note -> {
				String gistUrl = gistService.createGistFromNote(note);
				return ResponseEntity.ok(Map.of("url", gistUrl));
			})
			.orElse(ResponseEntity.notFound().build());
	}

	@PatchMapping("/{id}/pin")
	public ResponseEntity<Note> togglePin(@PathVariable Long id, @RequestBody Map<String, Boolean> updates) {
		return noteRepository.findById(id)
			.map(note -> {
				note.setPinned(updates.get("pinned"));
				return ResponseEntity.ok(noteRepository.save(note));
			})
			.orElse(ResponseEntity.notFound().build());
	}

	@PutMapping("/{id}")
	public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note updatedNote) {
		return noteRepository.findById(id)
			.map(note -> {
				note.setContent(updatedNote.getContent());
				note.setCategory(updatedNote.getCategory());
				// We keep the original createdAt but update the content
				return ResponseEntity.ok(noteRepository.save(note));
			})
			.orElse(ResponseEntity.notFound().build());
	}
}