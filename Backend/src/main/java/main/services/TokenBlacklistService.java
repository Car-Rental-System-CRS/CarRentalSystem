package main.services;

public interface TokenBlacklistService {
    void revoke(String token);
    boolean isRevoked(String token);
}
