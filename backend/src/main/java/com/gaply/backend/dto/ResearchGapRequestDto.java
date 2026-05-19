package com.gaply.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResearchGapRequestDto {

    @NotBlank(message = "title must not be blank")
    @Size(max = 500, message = "title must be 500 characters or fewer")
    private String title;

    @JsonProperty("abstract")
    @NotBlank(message = "abstract must not be blank")
    @Size(max = 8000, message = "abstract must be 8000 characters or fewer")
    private String abstractText;
}
