
package main.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import main.enums.Role;
import main.enums.Scope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.expiration-ms}")
    private long expirationMs;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractAccountId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims,T> resolver) {
        return resolver.apply(parseAllClaims(token));
    }

    private Claims parseAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String generateToken(CustomUserDetails user) {
        long now = System.currentTimeMillis();
        List<String> scopeNames = user.getScopes().stream()
                .map(Scope::name)
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(user.getAccountId().toString())
                .claim("role", user.getRole().name())
                .claim("customRoleId", user.getCustomRoleId() != null ? user.getCustomRoleId().toString() : null)
                .claim("scopes", scopeNames)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Role extractRole(String token) {
        String roleName = extractClaim(token, claims -> claims.get("role", String.class));
        return Role.valueOf(roleName);
    }

    public UUID extractCustomRoleId(String token) {
        String id = extractClaim(token, claims -> claims.get("customRoleId", String.class));
        return id != null ? UUID.fromString(id) : null;
    }

    @SuppressWarnings("unchecked")
    public Set<Scope> extractScopes(String token) {
        List<String> scopeNames = extractClaim(token, claims -> claims.get("scopes", List.class));
        if (scopeNames == null) return new HashSet<>();
        return scopeNames.stream()
                .map(Scope::valueOf)
                .collect(Collectors.toSet());
    }

    public boolean isTokenValid(String token, CustomUserDetails user) {
        final String accountId = extractAccountId(token);
        return accountId.equals(user.getAccountId().toString()) && !isExpired(token);
    }

    public boolean isExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}
