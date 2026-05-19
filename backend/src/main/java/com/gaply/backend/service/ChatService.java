package com.gaply.backend.service;

import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.gaply.backend.dto.ChatRequestDto;
import com.gaply.backend.dto.ChatResponseDto;
import com.gaply.backend.dto.PaperDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final PaperService paperService;

    public ChatResponseDto reply(ChatRequestDto request) {
        PaperDto paper = request.getPaperId() == null
                ? null
                : paperService.getById(request.getPaperId()).orElse(null);

        String subject = paper != null ? paper.getTitle() : "the paper";
        String message = request.getMessage() == null ? "" : request.getMessage().toLowerCase(Locale.ROOT);
        String content = generateReply(message, subject);

        return ChatResponseDto.builder()
                .id("a-" + UUID.randomUUID())
                .role("assistant")
                .content(content)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    private String generateReply(String message, String subject) {
        if (message.contains("summar")) {
            return String.format(
                    "In short, %s introduces a novel approach that achieves strong results on benchmark tasks. "
                            + "The key idea is to combine a clean architectural insight with scalable training, "
                            + "leading to improvements in both accuracy and efficiency.",
                    subject);
        }
        if (message.contains("contribut") || message.contains("main")) {
            return String.format(
                    "The main contributions of %s are: (1) a new architecture or formulation that addresses a "
                            + "long-standing limitation, (2) empirical validation across multiple benchmarks, and "
                            + "(3) ablations that isolate which components matter most.",
                    subject);
        }
        if (message.contains("methodolog") || message.contains("explain")) {
            return String.format(
                    "At a high level, %s starts from a known baseline and replaces a key component (often the "
                            + "bottleneck) with a more principled alternative. The training procedure is standard, but "
                            + "the architectural change unlocks significantly better scaling behavior.",
                    subject);
        }
        if (message.contains("limit") || message.contains("gap") || message.contains("open")) {
            return "Open questions include: how the method scales to much larger datasets, whether the gains "
                    + "transfer to out-of-distribution settings, and whether the assumptions hold in safety-critical "
                    + "applications. The authors flag these as future work.";
        }
        return String.format(
                "Great question. Based on %s, the relevant section discusses this in detail: the authors note "
                        + "tradeoffs between performance and complexity, and their experimental results suggest the "
                        + "proposed approach is competitive with prior work while being simpler to implement.",
                subject);
    }
}
