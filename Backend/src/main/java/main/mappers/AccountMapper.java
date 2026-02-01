package main.mappers;

import lombok.AllArgsConstructor;
import main.dtos.response.AccountResponse;
import main.entities.Account;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AccountMapper {
    private final ModelMapper mapper;

    public AccountResponse toUserResponseDto(Account account) {
        return mapper.map(account, AccountResponse.class);
    }
}
