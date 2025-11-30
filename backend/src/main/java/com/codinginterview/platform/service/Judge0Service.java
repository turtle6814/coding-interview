package com.codinginterview.platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class Judge0Service {

    private static final String JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
    private static final String RAPIDAPI_KEY = "8f3236d229mshf214478aac910f1p163fcejsnafaf9637ae53";
    private static final String RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com";
    
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> executeCode(String code, String language) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            int languageId = getLanguageId(language);
            if (languageId == -1) {
                result.put("success", false);
                result.put("output", "");
                result.put("error", "Unsupported language: " + language);
                return result;
            }

            String encodedCode = Base64.getEncoder().encodeToString(code.getBytes());

            String submissionJson = String.format(
                "{\"source_code\":\"%s\",\"language_id\":%d,\"stdin\":\"\"}",
                encodedCode, languageId
            );

            HttpRequest createRequest = HttpRequest.newBuilder()
                .uri(URI.create(JUDGE0_URL + "/submissions?base64_encoded=true&wait=true"))
                .header("Content-Type", "application/json")
                .header("X-RapidAPI-Key", RAPIDAPI_KEY)
                .header("X-RapidAPI-Host", RAPIDAPI_HOST)
                .POST(HttpRequest.BodyPublishers.ofString(submissionJson))
                .build();

            HttpResponse<String> response = httpClient.send(createRequest, 
                HttpResponse.BodyHandlers.ofString());

            JsonNode jsonResponse = objectMapper.readTree(response.body());
            
            String stdout = jsonResponse.has("stdout") && !jsonResponse.get("stdout").isNull()
                ? new String(Base64.getDecoder().decode(jsonResponse.get("stdout").asText()))
                : "";
                
            String stderr = jsonResponse.has("stderr") && !jsonResponse.get("stderr").isNull()
                ? new String(Base64.getDecoder().decode(jsonResponse.get("stderr").asText()))
                : "";
                
            String compileOutput = jsonResponse.has("compile_output") && !jsonResponse.get("compile_output").isNull()
                ? new String(Base64.getDecoder().decode(jsonResponse.get("compile_output").asText()))
                : "";

            int statusId = jsonResponse.get("status").get("id").asInt();
            String statusDescription = jsonResponse.get("status").get("description").asText();

            boolean success = statusId == 3;
            
            String output = stdout;
            if (!output.isEmpty() && !stderr.isEmpty()) {
                output += "\n" + stderr;
            } else if (output.isEmpty()) {
                output = stderr;
            }
            
            String error = "";
            if (!success) {
                error = statusDescription;
                if (!compileOutput.isEmpty()) {
                    error += "\n" + compileOutput;
                }
            }

            result.put("success", success);
            result.put("output", output.isEmpty() ? "(no output)" : output);
            result.put("error", error);

        } catch (Exception e) {
            result.put("success", false);
            result.put("output", "");
            result.put("error", "Execution error: " + e.getMessage());
        }

        return result;
    }

    private int getLanguageId(String language) {
        Map<String, Integer> languageMap = new HashMap<>();
        languageMap.put("javascript", 63);
        languageMap.put("typescript", 74);
        languageMap.put("python", 71);
        languageMap.put("java", 62);
        languageMap.put("cpp", 54);
        languageMap.put("c", 50);
        languageMap.put("csharp", 51);
        languageMap.put("go", 60);
        languageMap.put("rust", 73);
        languageMap.put("php", 68);
        languageMap.put("ruby", 72);
        languageMap.put("swift", 83);
        languageMap.put("kotlin", 78);
        
        return languageMap.getOrDefault(language.toLowerCase(), -1);
    }
}