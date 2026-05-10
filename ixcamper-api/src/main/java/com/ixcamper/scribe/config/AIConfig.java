package com.ixcamper.scribe.config;

import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIConfig {

   @Bean
	public OllamaChatModel ollamaChatModel() {
		// Direct connection to your local M2 Ollama instance
		var ollamaApi = new OllamaApi("http://127.0.0.1:11434");
		
		// In newer Spring AI versions, we use the constructor or setters
		OllamaOptions options = new OllamaOptions();
		options.setModel("llama3:latest");
		options.setTemperature(0.9f);

		return new OllamaChatModel(ollamaApi, options);
	}

    @Bean
    public ChatClient chatClient(OllamaChatModel chatModel) {
        // Now ChatClient has the ChatModel it was looking for
        return ChatClient.builder(chatModel).build();
    }
}