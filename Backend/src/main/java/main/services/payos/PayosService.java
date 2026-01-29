package main.services.payos;

public interface PayosService {
    String createPaymentLink(long payosPaymentCode, long amount);
}
