package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.request.ChatRequest;
import main.dtos.response.ChatResponse;
import main.services.ChatService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request
    ) {

        String aiResponse = chatService.generateResponse(request.getMessage());

        ChatResponse response = ChatResponse.builder()
                .response(aiResponse)
                .build();

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}