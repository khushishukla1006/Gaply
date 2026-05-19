package com.gaply.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Thin wrapper around Groq's OpenAI-compatible Chat Completions API.
 *
 * Groq exposes the same request/response schema as OpenAI under a different
 * base URL ({@code https://api.groq.com/openai/v1}), so the wire format and
 * parsing are unchanged from when this app called OpenAI directly.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GroqService {

    private static final String CHAT_COMPLETIONS_PATH = "/chat/completions";

    private final RestTemplate restTemplate;

    @Value("${gaply.groq.api-key:}")
    private String apiKey;

    @Value("${gaply.groq.base-url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    @Value("${gaply.groq.model:llama-3.3-70b-versatile}")
    private String model;

    @Value("${gaply.groq.temperature:0.4}")
    private double temperature;

    /**
     * Single-shot system + user prompt, response forced to a JSON object.
     * Used by research-gap analysis.
     */
    public String chatJson(String systemPrompt, String userPrompt) {
        return executeChatCompletion(Map.of(
                "model", model,
                "temperature", temperature,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt))));
    }

    /**
     * Multi-turn chat. Caller passes the full {@code messages} array including
     * system, prior turns, and the new user message.
     */
    public String chat(List<Map<String, String>> messages) {
        if (messages == null || messages.isEmpty()) {
            throw new GroqException("messages must not be empty");
        }
        return executeChatCompletion(Map.of(
                "model", model,
                "temperature", temperature,
                "messages", messages));
    }

    /* ---------------------- internals ---------------------- */

    private String executeChatCompletion(Map<String, Object> body) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new GroqException("Groq API key is not configured. Set GROQ_API_KEY.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<ChatCompletionResponse> response = restTemplate.postForEntity(
                    baseUrl + CHAT_COMPLETIONS_PATH, entity, ChatCompletionResponse.class);

            ChatCompletionResponse payload = response.getBody();
            if (payload == null || payload.getChoices() == null || payload.getChoices().isEmpty()) {
                throw new GroqException("Groq returned an empty response.");
            }

            String content = payload.getChoices().get(0).getMessage().getContent();
            if (content == null || content.isBlank()) {
                throw new GroqException("Groq returned no content.");
            }
            return content;
        } catch (RestClientException e) {
            log.error("Groq request failed: {}", e.getMessage());
            throw new GroqException("Failed to reach Groq: " + e.getMessage(), e);
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ChatCompletionResponse {
        private List<Choice> choices;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Choice {
        private Message message;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Message {
        private String role;
        private String content;
    }

    public static class GroqException extends RuntimeException {
        public GroqException(String message) {
            super(message);
        }

        public GroqException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
