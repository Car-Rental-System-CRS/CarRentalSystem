package main.mappers;

import lombok.RequiredArgsConstructor;
import main.dtos.response.AccountResponse;
import main.entities.Account;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountMapper {
    private final ModelMapper modelMapper;

    public AccountResponse toResponse(Account e) {
        return modelMapper.map(e, AccountResponse.class);
    }
}