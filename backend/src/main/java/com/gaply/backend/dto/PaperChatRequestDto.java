package com.gaply.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;
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
public class PaperChatRequestDto {

    @NotBlank(message = "title must not be blank")
    @Size(max = 500, message = "title must be 500 characters or fewer")
    private String title;

    @JsonProperty("abstract")
    @NotBlank(message = "abstract must not be blank")
    @Size(max = 8000, message = "abstract must be 8000 characters or fewer")
    private String abstractText;

    @NotBlank(message = "question must not be blank")
    @Size(max = 2000, message = "question must be 2000 characters or fewer")
    private String question;

    @Valid
    @Size(max = 20, message = "history may include at most 20 prior turns")
    private List<ChatTurnDto> history;
}
