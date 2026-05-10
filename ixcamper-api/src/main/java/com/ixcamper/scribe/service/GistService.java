package com.ixcamper.scribe.service;

import com.ixcamper.scribe.dto.github.GistFile;
import com.ixcamper.scribe.dto.github.GistRequest;
import com.ixcamper.scribe.model.Note;
import com.ixcamper.scribe.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GistService {

    private final RestTemplate restTemplate;
    private final NoteRepository noteRepository;

    @Value("${github.token}")
    private String githubToken;

    public GistService(NoteRepository noteRepository) {
        this.restTemplate = new RestTemplate();
        this.noteRepository = noteRepository;
    }

    /**
     * Exports a note to GitHub Gist and saves the resulting URL back to the database.
     * * @param note The Note entity to export
     * @return The HTML URL of the created Gist
     */
    public String createGistFromNote(Note note) {
        String url = "https://api.github.com/gists";

        // 1. Prepare dynamic filename (using category for better GitHub organization)
        String categoryLabel = (note.getCategory() != null) ? note.getCategory().toLowerCase() : "scratchpad";
        String fileName = "ixcamper-" + categoryLabel + "-" + note.getId() + ".md";
        
        GistFile gistFile = new GistFile(note.getContent());

        // 2. Build the request DTO (Public is false by default)
        GistRequest request = new GistRequest(
            "Exported from Ixcamper Scribe: " + (note.getCategory() != null ? note.getCategory() : "General"),
            false, 
            Map.of(fileName, gistFile)
        );

        // 3. Set Headers for GitHub API v3
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(githubToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/vnd.github+json");
        headers.set("X-GitHub-Api-Version", "2022-11-28");

        HttpEntity<GistRequest> entity = new HttpEntity<>(request, headers);

        // 4. Execute the POST and handle the response
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                String htmlUrl = (String) response.getBody().get("html_url");
                
                // 5. SYNC STATUS LOGIC: Update the Note in the DB with the new Gist link
                note.setGistUrl(htmlUrl);
                noteRepository.save(note);
                
                return htmlUrl;
            } else {
                throw new RuntimeException("GitHub returned status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            // Log the error (SLF4J recommended for Spring Boot)
            System.err.println("Failed to export to GitHub: " + e.getMessage());
            throw new RuntimeException("GitHub Export Error: " + e.getMessage());
        }
    }
}