package com.gaply.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gaply.backend.dto.ResearchGapRequestDto;
import com.gaply.backend.dto.ResearchGapResponseDto;
import com.gaply.backend.service.GroqService.GroqException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResearchGapService {

    private static final String SYSTEM_PROMPT = """
            You are a research analysis assistant. Given a paper's title and abstract,
            produce a critical analysis that highlights what the work does NOT cover.

            Respond with a single JSON object only, with these exact keys:
              - "simplifiedSummary": string. 2-3 sentences explaining the paper in plain language for a non-expert.
              - "limitations": array of 3-5 short strings. Concrete limitations of the work itself
                (assumptions, scope, evaluation gaps, dataset constraints).
              - "unexploredAreas": array of 3-5 short strings. Adjacent questions the paper does not address.
              - "futureOpportunities": array of 3-5 short strings. Specific, actionable directions for future research.

            Be specific and grounded in the abstract. Avoid generic filler. Each array item should be one concise sentence.
            """;

    private final GroqService groqService;
    private final ObjectMapper objectMapper;
    private final AiFallbackService fallbackService;

    @Value("${gaply.groq.fallback-enabled:true}")
    private boolean fallbackEnabled;

    public ResearchGapResponseDto analyze(ResearchGapRequestDto request) {
        String title = request.getTitle().strip();
        String abstractText = request.getAbstractText().strip();

        String userPrompt = """
                Title: %s

                Abstract: %s
                """.formatted(title, abstractText);

        try {
            String json = groqService.chatJson(SYSTEM_PROMPT, userPrompt);
            try {
                ResearchGapResponseDto parsed = objectMapper.readValue(json, ResearchGapResponseDto.class);
                parsed.setFallback(false);
                return parsed;
            } catch (JsonProcessingException e) {
                log.warn("Groq returned unparseable JSON; serving fallback. body='{}'", json);
                return fallbackOrThrow(title, abstractText, e);
            }
        } catch (GroqException e) {
            log.warn("Groq call failed for research-gap analysis ({}); serving fallback.", e.getMessage());
            return fallbackOrThrow(title, abstractText, e);
        }
    }

    private ResearchGapResponseDto fallbackOrThrow(String title, String abstractText, Throwable cause) {
        if (!fallbackEnabled) {
            if (cause instanceof GroqException gex) throw gex;
            throw new ResearchGapAnalysisException(
                    "AI response could not be parsed as the expected JSON shape.", cause);
        }
        return fallbackService.researchGapFallback(title, abstractText);
    }

    public static class ResearchGapAnalysisException extends RuntimeException {
        public ResearchGapAnalysisException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
