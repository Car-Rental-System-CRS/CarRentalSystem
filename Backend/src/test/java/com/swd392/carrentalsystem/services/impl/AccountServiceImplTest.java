package com.swd392.carrentalsystem.services.impl;

import main.dtos.request.UpdateAccountProfileRequest;
import main.dtos.response.AccountResponse;
import main.entities.Account;
import main.entities.CustomRole;
import main.enums.Role;
import main.exceptions.ConflictException;
import main.mappers.AccountMapper;
import main.repositories.AccountRepository;
import main.repositories.CustomRoleRepository;
import main.services.impl.AccountServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AccountMapper accountMapper;

    @Mock
    private CustomRoleRepository customRoleRepository;

    @InjectMocks
    private AccountServiceImpl accountService;

    @Test
    void me_ShouldReturnCurrentAccountDetails_WhenAccountExists() {
        UUID accountId = UUID.randomUUID();
        Account account = new Account();
        account.setId(accountId);
        account.setName("Jane Doe");
        account.setEmail("jane@example.com");
        account.setPhone("0123456789");
        account.setRole(Role.USER);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        AccountResponse response = accountService.me(accountId);

        assertNotNull(response);
        assertEquals(accountId, response.getId());
        assertEquals("Jane Doe", response.getName());
        assertEquals("jane@example.com", response.getEmail());
        assertEquals("0123456789", response.getPhone());
        assertEquals(Role.USER, response.getBaseRole());
        assertNotNull(response.getScopes());
        assertEquals(0, response.getScopes().size());
    }

    @Test
    void updateMyProfile_ShouldPersistEditableFields_WhenRequestIsValid() {
        UUID accountId = UUID.randomUUID();
        CustomRole customRole = new CustomRole();
        customRole.setName("Renter");

        Account account = new Account();
        account.setId(accountId);
        account.setName("Old Name");
        account.setEmail("old@example.com");
        account.setPhone("0999999999");
        account.setRole(Role.USER);
        account.setCustomRole(customRole);
        account.setPassword(new byte[]{1, 2, 3});

        UpdateAccountProfileRequest request = UpdateAccountProfileRequest.builder()
                .name("New Name")
                .email("new@example.com")
                .phone("0123456789")
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.existsByEmailAndIdNot("new@example.com", accountId)).thenReturn(false);
        when(accountRepository.save(account)).thenReturn(account);

        AccountResponse response = accountService.updateMyProfile(accountId, request);

        assertNotNull(response);
        assertEquals("New Name", account.getName());
        assertEquals("new@example.com", account.getEmail());
        assertEquals("0123456789", account.getPhone());
        assertEquals(Role.USER, account.getRole());
        assertEquals(customRole, account.getCustomRole());
        assertEquals(3, account.getPassword().length);
        assertEquals("New Name", response.getName());
        assertEquals("new@example.com", response.getEmail());
    }

    @Test
    void updateMyProfile_ShouldAllowClearingPhone_WhenPhoneIsBlank() {
        UUID accountId = UUID.randomUUID();
        Account account = new Account();
        account.setId(accountId);
        account.setName("Jane Doe");
        account.setEmail("jane@example.com");
        account.setPhone("0123456789");
        account.setRole(Role.USER);

        UpdateAccountProfileRequest request = UpdateAccountProfileRequest.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .phone("   ")
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.existsByEmailAndIdNot("jane@example.com", accountId)).thenReturn(false);
        when(accountRepository.save(account)).thenReturn(account);

        AccountResponse response = accountService.updateMyProfile(accountId, request);

        assertNull(account.getPhone());
        assertNull(response.getPhone());
    }

    @Test
    void updateMyProfile_ShouldRejectDuplicateEmail_WhenAnotherAccountUsesIt() {
        UUID accountId = UUID.randomUUID();
        Account account = new Account();
        account.setId(accountId);
        account.setName("Jane Doe");
        account.setEmail("jane@example.com");
        account.setRole(Role.USER);

        UpdateAccountProfileRequest request = UpdateAccountProfileRequest.builder()
                .name("Jane Doe")
                .email("taken@example.com")
                .phone("0123456789")
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.existsByEmailAndIdNot("taken@example.com", accountId)).thenReturn(true);

        ConflictException ex = assertThrows(
                ConflictException.class,
                () -> accountService.updateMyProfile(accountId, request)
        );

        assertEquals("Email address is already in use", ex.getMessage());
        verify(accountRepository, never()).save(account);
    }

    @Test
    void updateMyProfile_ShouldRejectInvalidPhone_WhenPhoneFormatIsUnsupported() {
        UUID accountId = UUID.randomUUID();
        Account account = new Account();
        account.setId(accountId);
        account.setRole(Role.USER);

        UpdateAccountProfileRequest request = UpdateAccountProfileRequest.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .phone("abc")
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> accountService.updateMyProfile(accountId, request)
        );

        assertEquals("Phone number format is invalid", ex.getMessage());
        verify(accountRepository, never()).save(account);
    }
}
