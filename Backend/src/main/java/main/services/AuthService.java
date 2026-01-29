package main.services;

import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;
import main.dtos.response.AuthResponse;

public interface AuthService {
    AuthResponse register(CreateAccountRequest req);
    AuthResponse login(LoginRequest req);
}
