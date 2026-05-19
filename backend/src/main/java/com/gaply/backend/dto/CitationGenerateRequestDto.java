package com.gaply.backend.dto;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitationGenerateRequestDto {

    @NotBlank(message = "title must not be blank")
    @Size(max = 500, message = "title must be 500 characters or fewer")
    private String title;

    @NotEmpty(message = "authors must include at least one name")
    @Size(max = 100, message = "authors may include at most 100 names")
    private List<@NotBlank @Size(max = 200) String> authors;

    @NotNull(message = "year is required")
    @Min(value = 1000, message = "year must be a 4-digit year")
    @Max(value = 2999, message = "year must be a 4-digit year")
    private Integer year;

    @Size(max = 300, message = "journal must be 300 characters or fewer")
    private String journal;

    @Size(max = 200, message = "doi must be 200 characters or fewer")
    private String doi;
}
