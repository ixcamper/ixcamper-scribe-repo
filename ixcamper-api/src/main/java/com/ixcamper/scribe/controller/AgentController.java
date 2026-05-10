package com.ixcamper.scribe.controller;

import java.util.Map;

import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ixcamper.scribe.dto.NoteRequest;
import com.ixcamper.scribe.service.AgentService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final AgentService agentService;
    private final OllamaChatModel chatModel; // 1. Declare the field

    // 2. Inject it through the constructor
    public AgentController(AgentService agentService, OllamaChatModel chatModel) {
        this.agentService = agentService;
        this.chatModel = chatModel;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> getHealth() {
        try {
            // Now chatModel is resolved!
            boolean isUp = !chatModel.call(new org.springframework.ai.chat.prompt.Prompt("hi"))
                                     .getResults().isEmpty();
            return ResponseEntity.ok(Map.of("status", isUp ? "UP" : "DOWN"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("status", "DOWN"));
        }
    }

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeNote(@RequestBody NoteRequest request) {
        return ResponseEntity.ok(agentService.generateInsight(request.getContent()));
    }
}