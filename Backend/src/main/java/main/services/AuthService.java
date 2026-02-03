package main.services;

import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;

public interface AuthService {
    void register(CreateAccountRequest request);
    String login(LoginRequest request);
    void logout(String bearerToken);
}