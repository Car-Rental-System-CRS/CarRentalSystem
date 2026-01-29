package main.mappers;

import main.dtos.response.AuthResponse;
import main.entities.Account;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {

    private final ModelMapper mapper;

    public AccountMapper(ModelMapper mapper) {
        this.mapper = mapper;
        // có thể cấu hình mapping cụ thể nếu cần
    }

    public AuthResponse toResponse(Account a) {
        AuthResponse res = new AuthResponse();
        // Điền các field bạn muốn trả về
        // ví dụ nếu AccountResponse có các trường: id, email, fullName, role
        // Nếu AccountResponse đã khác, hãy sửa cho khớp
        // (để đơn giản, map thủ công)
        try {
            // nếu AccountResponse = DTO đơn giản
            mapper.map(a, res);
            return res;
        } catch (Exception e) {
            // fallback: map thủ công
            // res.setId(a.getId()); ...
            return res;
        }
    }
}
