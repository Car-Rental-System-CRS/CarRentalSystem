package main.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;
import main.dtos.response.AccountResponse;
import main.dtos.response.AuthResponse;
import main.services.AccountService;
import main.services.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockBean AuthService authService;
    @MockBean AccountService accountService;

    @Test
    void register_returns_200() throws Exception {
        var resp = AccountResponse.builder()
                .id(UUID.randomUUID()).name("Nghia").email("nghia@example.com").build();
        when(authService.register(any(CreateAccountRequest.class))).thenReturn(resp);

        var req = new CreateAccountRequest();
        req.setName("Nghia"); req.setEmail("nghia@example.com"); req.setPassword("123456");

        mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("nghia@example.com"));
    }

    @Test
    void login_returns_token() throws Exception {
        var auth = AuthResponse.builder()
                .token("fake").tokenType("Bearer")
                .userId(UUID.randomUUID()).email("a@b.com").name("A").role("USER").build();
        when(authService.login(any(LoginRequest.class))).thenReturn(auth);

        var req = new LoginRequest();
        req.setEmail("a@b.com"); req.setPassword("123456");

        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("fake"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void me_returns_profile() throws Exception {
        var resp = AccountResponse.builder()
                .id(UUID.randomUUID()).name("Me").email("me@a.com").build();
        when(accountService.me()).thenReturn(resp);

        mvc.perform(get("/api/auth/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("me@a.com"));
    }
}