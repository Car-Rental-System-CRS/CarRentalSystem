
package main.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import main.services.TokenBlacklistService;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import main.services.AccountService;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AccountService accountService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        final String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String prefix = "Bearer ";
        String jwt = null;

        if (header != null && header.startsWith(prefix)) {
            jwt = header.substring(prefix.length());
        }

        if (jwt != null && tokenBlacklistService.isRevoked(jwt) == false) {
            String accountId = null;
            try {
                accountId = jwtService.extractAccountId(jwt);
            } catch (Exception ignored) { }

            if (accountId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                CustomUserDetails user = accountService.loadUserByUsername(accountId);
                if (jwtService.isTokenValid(jwt, user)) {
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
