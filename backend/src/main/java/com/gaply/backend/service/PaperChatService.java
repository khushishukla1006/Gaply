package com.gaply.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.gaply.backend.dto.ChatTurnDto;
import com.gaply.backend.dto.PaperChatRequestDto;
import com.gaply.backend.dto.PaperChatResponseDto;
import com.gaply.backend.service.GroqService.GroqException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaperChatService {

    private static final String SYSTEM_TEMPLATE = """
            You are an expert research assistant helping a user understand a single academic paper.
            Always ground your answers in the paper's title and abstract provided below.
            If the question cannot be answered from the abstract alone, say so honestly and suggest
            what additional context (e.g. methods section, experiments, related work) would be needed.
            Be concise, accurate, and pedagogical. Use plain language and short paragraphs.

            Paper title: %s

            Paper abstract: %s
            """;

    private final GroqService groqService;
    private final AiFallbackService fallbackService;

    @Value("${gaply.groq.fallback-enabled:true}")
    private boolean fallbackEnabled;

    public PaperChatResponseDto chat(PaperChatRequestDto request) {
        String title = request.getTitle().strip();
        String abstractText = request.getAbstractText().strip();
        String question = request.getQuestion().strip();

        String systemPrompt = SYSTEM_TEMPLATE.formatted(title, abstractText);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        if (request.getHistory() != null) {
            for (ChatTurnDto turn : request.getHistory()) {
                if (turn == null || turn.getRole() == null || turn.getContent() == null) {
                    continue;
                }
                String role = turn.getRole();
                if ("user".equals(role) || "assistant".equals(role)) {
                    messages.add(Map.of("role", role, "content", turn.getContent()));
                }
            }
        }

        messages.add(Map.of("role", "user", "content", question));

        try {
            String answer = groqService.chat(messages);
            return PaperChatResponseDto.builder()
                    .answer(answer.strip())
                    .fallback(false)
                    .build();
        } catch (GroqException e) {
            if (!fallbackEnabled) throw e;
            log.warn("Groq chat failed ({}); serving fallback response.", e.getMessage());
            return PaperChatResponseDto.builder()
                    .answer(fallbackService.chatFallback(title, question))
                    .fallback(true)
                    .build();
        }
    }
}
