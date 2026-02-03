package main.entities;

import jakarta.persistence.*;
import lombok.*;
import main.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Table(name = "bookings")
public class Booking extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Foreign key to Account
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(
//            name = "account_id",
//            nullable = false
//    )
//    private Account account;

    // info id
    // damage report id
    // booking cars



    private BigDecimal totalPrice;
    private BigDecimal bookingPrice;

    private LocalDate expectedReceiveDate;
    private LocalDate expectedReturnDate;

    // Payment transactions
    @OneToMany(
            mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PaymentTransaction> paymentTransactions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

}
