package com.ixcamper.scribe.dto;

// Remove 'static' here. Only 'public' is needed for a top-level class.
public class NoteRequest {
    private String content;

    // Default constructor is required for JSON deserialization
    public NoteRequest() {}

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}