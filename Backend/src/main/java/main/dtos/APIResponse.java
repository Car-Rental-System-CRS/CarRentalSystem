package main.dtos;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class APIResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String error;
    private Instant timestamp;
}
