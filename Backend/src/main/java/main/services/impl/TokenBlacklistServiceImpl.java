package main.services.impl;

import main.services.TokenBlacklistService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Demo lưu token đã revoke trong memory.
 * Prod: chuyển qua Redis/DB + TTL.
 */
@Service
public class TokenBlacklistServiceImpl implements TokenBlacklistService {
    private final Map<String, Instant> revoked = new ConcurrentHashMap<>();

    @Override
    public void revoke(String token) {
        revoked.put(token, Instant.now());
    }

    @Override
    public boolean isRevoked(String token) {
        return revoked.containsKey(token);
    }
}