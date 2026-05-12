package com.ixcamper.scribe.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev") // Only runs when spring.profiles.active=dev
public class VaultValidator implements CommandLineRunner {

    // These match the keys you put in Vault
    @Value("${spring.datasource.username:not_found}")
    private String vaultUser;

    @Value("${spring.datasource.password:not_found}")
    private String vaultPass;

    @Override
    public void run(String... args) {
        System.out.println("----------------------------------------");
        System.out.println("🛡️ VAULT CONFIGURATION CHECK");
        System.out.println("Status: " + (vaultUser.equals("not_found") ? "❌ FAILED" : "✅ SUCCESS"));
        System.out.println("Injected Username: " + vaultUser);
        // We mask the password for security, but check if it's there
        System.out.println("Password Loaded: " + (!vaultPass.equals("not_found")));
        System.out.println("----------------------------------------");
    }
}