package com.gaply.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gaply.backend.dto.ChatRequestDto;
import com.gaply.backend.dto.ChatResponseDto;
import com.gaply.backend.service.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponseDto chat(@RequestBody ChatRequestDto request) {
        return chatService.reply(request);
    }
}
