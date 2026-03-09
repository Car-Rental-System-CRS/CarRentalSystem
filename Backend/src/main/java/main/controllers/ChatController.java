package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.ChatRequest;
import main.dtos.response.ChatResponse;
import main.services.ChatService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/chat") // Base path defined here
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * Send a prompt to the AI assistant
     */
    @PostMapping
    public ResponseEntity<APIResponse<ChatResponse>> chat(@RequestBody ChatRequest request) {
        // 1. Generate the response
        String reply = chatService.generateResponse(request.getMessage());
        ChatResponse data = new ChatResponse(reply);

        // 2. Build the APIResponse using your specific fields
        APIResponse<ChatResponse> response = APIResponse.<ChatResponse>builder()
                .success(true)
                .message("Success")
                .data(data)
                .error(null) // Success case: no error
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.ok(response);
    }
}