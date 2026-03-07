package main.entities;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.Scope;

@Entity
@Table(name = "custom_role_scopes", uniqueConstraints = @UniqueConstraint(columnNames = {"custom_role_id", "scope"}))
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CustomRoleScope {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_role_id", nullable = false)
    private CustomRole customRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Scope scope;
}
