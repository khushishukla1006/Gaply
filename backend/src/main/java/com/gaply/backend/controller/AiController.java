package com.gaply.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gaply.backend.dto.PaperChatRequestDto;
import com.gaply.backend.dto.PaperChatResponseDto;
import com.gaply.backend.dto.ResearchGapRequestDto;
import com.gaply.backend.dto.ResearchGapResponseDto;
import com.gaply.backend.service.GroqService.GroqException;
import com.gaply.backend.service.PaperChatService;
import com.gaply.backend.service.ResearchGapService;
import com.gaply.backend.service.ResearchGapService.ResearchGapAnalysisException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final ResearchGapService researchGapService;
    private final PaperChatService paperChatService;

    @PostMapping("/research-gap")
    public ResearchGapResponseDto analyzeResearchGap(@Valid @RequestBody ResearchGapRequestDto request) {
        return researchGapService.analyze(request);
    }

    @PostMapping("/chat")
    public PaperChatResponseDto chatWithPaper(@Valid @RequestBody PaperChatRequestDto request) {
        return paperChatService.chat(request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    @ExceptionHandler(GroqException.class)
    public ResponseEntity<Map<String, Object>> handleGroq(GroqException e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(ResearchGapAnalysisException.class)
    public ResponseEntity<Map<String, Object>> handleAnalysis(ResearchGapAnalysisException e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", e.getMessage()));
    }
}
