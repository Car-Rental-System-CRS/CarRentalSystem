package main.services.payos;

public interface PayosService {
    String createPaymentLink(long payosOrderCode, long amount);
}
