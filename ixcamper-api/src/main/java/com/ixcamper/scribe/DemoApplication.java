package com.ixcamper.scribe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = { 
    org.springframework.ai.autoconfigure.ollama.OllamaAutoConfiguration.class,
	org.springframework.cloud.function.context.config.ContextFunctionCatalogAutoConfiguration.class
})
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
