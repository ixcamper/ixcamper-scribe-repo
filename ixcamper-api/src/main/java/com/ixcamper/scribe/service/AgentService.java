package com.ixcamper.scribe.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AgentService {
    private final ChatClient chatClient;

    public AgentService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public String generateInsight(String content) {
		// If content is null, provide a default or return early
		String promptText = (content != null) ? content : "Provide a general developer tip.";

		try {
			return chatClient.prompt()
				.user(promptText) // ChatClient will no longer see 'null'
				.call()
				.content();
		} catch (Exception e) {
			return "Agent insight unavailable: " + e.getMessage();
		}
	}
}