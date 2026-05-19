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
public class ResearchGapResponseDto {

    private String simplifiedSummary;
    private List<String> limitations;
    private List<String> unexploredAreas;
    private List<String> futureOpportunities;

    /** True when this response was produced by the offline fallback, not the live AI provider. */
    private boolean fallback;
}
