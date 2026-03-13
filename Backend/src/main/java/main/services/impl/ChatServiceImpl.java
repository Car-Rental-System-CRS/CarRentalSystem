package main.services.impl;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.Part;
import lombok.RequiredArgsConstructor;
import main.services.CarTypeService;
import main.services.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    @Autowired
    private Client client;
    @Autowired
    private CarTypeService carTypeService;

    public String generateResponse(String prompt) {
        String inventoryData = getInventoryContext();

        // 2. Define the system instruction to ground the AI
        String systemInstruction = "You are a helpful car rental assistant. " +
                "Answer user questions ONLY using the following inventory:\n" +
                inventoryData;

        // 3. Configure the call with the system instruction
        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(systemInstruction)))
                .build();

        // 4. Send request to Gemini
        return client.models.generateContent("gemini-2.5-flash", prompt, config).text();
    }

    private String getInventoryContext() {
        // Use your service method that handles the 2-query fetching logic
        return carTypeService.getAllInventoryWithData().stream()
                .map(ct -> String.format(
                        "- Model: %s | Brand: %s | Price: $%s/day | Seats: %d | Efficiency: %.2f kWh/km | Available Units: %d | Features: %s",
                        ct.getName(),
                        (ct.getCarBrand() != null ? ct.getCarBrand().getName() : "N/A"),
                        ct.getPrice(),
                        ct.getNumberOfSeats(),
                        ct.getConsumptionKwhPerKm(),
                        (ct.getCars() != null ? ct.getCars().size() : 0),
                        (ct.getModelFeatures() != null ? ct.getModelFeatures().stream()
                                .map(mf -> mf.getCarFeature().getName())
                                .collect(Collectors.joining(", ")) : "None")
                ))
                .collect(Collectors.joining("\n"));
    }
}