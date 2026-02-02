package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.response.PaymentTransactionResponse;
import main.entities.Booking;
import main.entities.PaymentTransaction;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;
import main.mappers.PaymentTransactionMapper;
import main.repositories.BookingRepository;
import main.repositories.PaymentTransactionRepository;
import main.services.PaymentTransactionService;
import main.services.PayosService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PayosService payosService;
    private final PaymentTransactionMapper paymentTransactionMapper;

    @Override
    @Transactional
    public PaymentTransactionResponse createPayment(UUID bookingId, PaymentPurpose paymentPurpose, Long amount) {

        // Fetch booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));


        // Generate PayOS order code
        long payOSOrderCode = System.currentTimeMillis() / 1000;

        // Create PaymentTransaction (PENDING, no checkoutUrl yet)
        PaymentTransaction transaction = PaymentTransaction.builder()
                .booking(booking)
                .purpose(paymentPurpose)
                .amount(amount) //amount is decided per case
                .payOSPaymentCode(payOSOrderCode)
                .status(PaymentStatus.PENDING)
                .build();

        paymentTransactionRepository.save(transaction);

        // Call PayOS → get checkout URL
        String paymentLink =
                payosService.createPaymentLink(
                        payOSOrderCode,
                        transaction.getAmount()
                );

        PaymentTransactionResponse response =paymentTransactionMapper.toPaymentTransactionResponse(transaction);
        response.setPaymentUrl(paymentLink);
        return response;
    }



    @Override
    public PaymentTransactionResponse getById(UUID paymentTransactionId) {

        // TODO: fetch payment transaction by id
        // TODO: map entity -> response

        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public PaymentTransactionResponse getLatestByBookingId(UUID bookingId) {

        // TODO: fetch latest payment by bookingId (order by createdAt desc)
        // TODO: map entity -> response

        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public List<PaymentTransactionResponse> getAllByBookingId(UUID bookingId) {

//        return paymentTransactionRepository.findByBooking_Id(bookingId)
//                .stream()
//                .map(tx -> PaymentTransactionResponse.builder()
//                        .id(tx.getId())
//                        .bookingId(bookingId)
//                        .amount(tx.getAmount())
//                        .payOSPaymentCode(tx.getPayOSPaymentCode())
//                        .status(tx.getStatus())
//                        .purpose(tx.getPurpose())
//                        .createdAt(tx.getCreatedAt())
//                        .lastUpdatedAt(tx.getLastUpdatedAt())
//                        .build()
//                )
//                .toList();

        return paymentTransactionMapper.toListPaymentTransactionResponse(paymentTransactionRepository.findByBooking_Id(bookingId));
    }

}
