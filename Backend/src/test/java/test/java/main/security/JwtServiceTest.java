package test.java.main.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import main.security.JwtService;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret",
            "Z0H7V8s1o5XyT3d5f7m9p1s2u4w6y8z0Q2S4V6Y8Z0B2D4F6H8J0L2N4P6R8T0U2==");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 600000L);
    }

    @Test
    void generate_and_validate_token_ok() {
        var user = User.withUsername("john@example.com").password("x").roles("USER").build();
        String token = jwtService.generateToken(user, Map.of("role", "USER"));

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("john@example.com");
        assertThat(jwtService.isExpired(token)).isFalse();
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }
}