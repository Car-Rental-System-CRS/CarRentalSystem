package main.entities;

import jakarta.persistence.*;
import lombok.*;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    //entity connections
    // Foreign key to Booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "booking_id",
            nullable = false
    )
    private Booking booking;

    // Foreign key to Account
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(
//            name = "account_id",
//            nullable = false
//    )
//    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentPurpose purpose;

    private Long amount; // VND



    // PayOS payment code
    @Column(nullable = false, unique = true)
    private long payOSPaymentCode;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime lastUpdatedAt;

}
