package com.gaply.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperSearchResultDto {

    private String id;

    private String title;

    @JsonProperty("abstract")
    private String abstractText;

    private List<String> authors;

    private Integer year;

    private String url;

    private String journal;

    private String doi;
}
