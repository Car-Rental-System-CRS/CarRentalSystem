package main.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final UserDetailsService uds;

    public JwtAuthFilter(JwtService jwt, UserDetailsService uds) {
        this.jwt = jwt;
        this.uds = uds;
    }

    // ⭐⭐⭐ METHOD NÀY PHẢI NẰM NGOÀI CONSTRUCTOR ⭐⭐⭐
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Bypass Swagger, auth, public
        if (shouldBypass(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check Authorization header
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        String username;

        try {
            username = jwt.extractUsername(token);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        // Authenticate user
        if (username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            var userDetails = uds.loadUserByUsername(username);

            if (jwt.isTokenValid(token, userDetails.getUsername())) {
                var auth = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldBypass(String path, String method) {

        // Preflight
        if ("OPTIONS".equalsIgnoreCase(method)) return true;

        // Swagger
        if (path.startsWith("/v3/api-docs")) return true;
        if (path.startsWith("/swagger-ui")) return true;
        if (path.startsWith("/swagger-resources")) return true;
        if (path.startsWith("/webjars")) return true;

        // Public
        if (path.equals("/") || path.equals("/ping")) return true;

        // Auth
        if (path.startsWith("/api/auth")) return true;

        // Actuator
        if (path.startsWith("/actuator")) return true;

        return false;
    }
}