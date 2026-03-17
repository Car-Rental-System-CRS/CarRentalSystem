package main.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.BookingStatus;

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

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(
           name = "account_id",
           nullable = false
   )
   private Account account;

    private BigDecimal totalPrice;
    private BigDecimal bookingPrice;
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private BigDecimal overdueCharge;

    private LocalDateTime actualReceiveDate;
    private LocalDateTime actualReturnDate;
    private LocalDateTime expectedReceiveDate;
    private LocalDateTime expectedReturnDate;
        private LocalDateTime postTripInspectionAt;
        private Boolean postTripInspectionCompleted;

        @Column(length = 1000)
        private String pickupNotes;

        @Column(length = 1000)
        private String returnNotes;

    // Booking cars
    @OneToMany(
            mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<BookingCar> bookingCars;

    // Payment transactions
    @OneToMany(
            mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PaymentTransaction> paymentTransactions;

    @OneToMany(
            mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<BookingNotification> notifications;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private PostTripInspection postTripInspection;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

}
