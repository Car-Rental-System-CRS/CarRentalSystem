package main.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "accounts", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Hibernate 6.x (Spring Boot 3) OK
    private UUID id;

    @Nationalized
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.USER;
    
    private String phone;

    @Lob
    @Column(nullable = false)
    private byte[] password;
}
