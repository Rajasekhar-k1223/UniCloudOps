package com.unicloudops.sdk.core;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class UnicloudClient {
    private final String baseUrl;
    private final String apiKey;
    private final String token;
    private final HttpClient httpClient;
    private final ObjectMapper mapper;

    public UnicloudClient(String baseUrl, String apiKey, String token) {
        this.baseUrl = baseUrl != null ? baseUrl : "http://localhost:8085";
        this.apiKey = apiKey;
        this.token = token;
        
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
            
        this.mapper = new ObjectMapper();
    }

    public <T> T get(String path, Class<T> responseType) throws Exception {
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create(this.baseUrl + path))
            .header("Content-Type", "application/json")
            .header("User-Agent", "unicloudops-sdk-java/2.0.0")
            .GET();

        if (this.token != null) {
            requestBuilder.header("Authorization", "Bearer " + this.token);
        } else if (this.apiKey != null) {
            requestBuilder.header("X-API-Key", this.apiKey);
        }

        HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() >= 400) {
            throw new RuntimeException("API Error: " + response.statusCode() + " " + response.body());
        }

        return mapper.readValue(response.body(), responseType);
    }
}
