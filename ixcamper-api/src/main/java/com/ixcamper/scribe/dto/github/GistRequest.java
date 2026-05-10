package com.ixcamper.scribe.dto.github;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * DTO for creating a new Gist via the GitHub REST API.
 */
public record GistRequest(
    String description,
    
    @JsonProperty("public") 
    boolean isPublic,
    
    Map<String, GistFile> files
) {}