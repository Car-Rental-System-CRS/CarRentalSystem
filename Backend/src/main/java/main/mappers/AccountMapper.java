package main.mappers;

import lombok.RequiredArgsConstructor;
import main.dtos.response.AccountResponse;
import main.entities.Account;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import main.dtos.request.CreateAccountRequest;

@Component
@RequiredArgsConstructor
public class AccountMapper {
    private final ModelMapper modelMapper;

    public AccountResponse toResponse(Account e) {
        return modelMapper.map(e, AccountResponse.class);
    }

    public Account fromCreateAccountRequestToEntity(CreateAccountRequest req) {
        return modelMapper.map(req, Account.class);
    }
}