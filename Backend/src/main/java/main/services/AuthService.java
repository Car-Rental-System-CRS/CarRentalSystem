package main.services;

import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;
import main.dtos.response.AccountResponse;
import main.dtos.response.AuthResponse;

public interface AuthService {
    AccountResponse register(CreateAccountRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String bearerToken);
}