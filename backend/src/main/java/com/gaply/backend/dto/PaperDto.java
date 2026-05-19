package com.gaply.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperDto {
    private String id;
    private String title;
    private List<AuthorDto> authors;
    private String abstractText;
    private String summary;
    private List<String> tags;
    private int publishedYear;
    private String journal;
    private Integer citations;
    private String doi;
    private String aiExplanation;
    private List<String> researchGaps;
}
