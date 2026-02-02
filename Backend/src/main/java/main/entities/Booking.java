package main.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import main.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Table(name = "bookings")
public class Booking {

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
    // carId

    //prices, not sure??

    private long totalPrice;
    private long depositPrice;
    private long bookingPrice;
    private long rentalPrice;

    private LocalDate expectedReceiveDate;
    private LocalDate expectedReturnDate;

    // 🔗 Payment transactions
    @OneToMany(
            mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PaymentTransaction> paymentTransactions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
