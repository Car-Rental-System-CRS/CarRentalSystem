package main.dtos.request;

import lombok.Data;

@Data
public class PayosWebhookRequest {

    private String code;        // e.g. "00"
    private String desc;        // message
    private PayosWebhookData data;

    @Data
    public static class PayosWebhookData {
        private Long orderCode;     // PayOS orderCode
        private String status;      // PAID / CANCELLED / FAILED
        private Long amount;
    }
}
