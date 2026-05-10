package com.ixcamper.scribe.model; // This MUST match the folder path

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(name = "notes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

	@Column(name = "created_at", updatable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
	@JsonProperty("createdAt") 
	private java.time.LocalDateTime createdAt;
    
	private String content;

	private String category; // e.g., "ANGULAR", "JAVA"

	@Column(name = "pinned")
	private boolean pinned = false;

	private String gistUrl;
	

    // Getters and Setters (Since Lombok was having issues, let's keep them manual for now)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
	public String getCategory() { return category; }
	public void setCategory(String category) { this.category = category; }
	public boolean isPinned() { return pinned; }
	public void setPinned(boolean pinned) { this.pinned = pinned; }
	public String getGistUrl() { return gistUrl; }
	public void setGistUrl(String gistUrl) { this.gistUrl = gistUrl; }

    @PrePersist
	protected void onCreate() {
    	if (this.createdAt == null) {
        	this.createdAt = java.time.LocalDateTime.now();
    	}
	}
}