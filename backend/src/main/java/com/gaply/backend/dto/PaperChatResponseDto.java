package com.gaply.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperChatResponseDto {

    private String answer;

    /** True when this answer was produced by the offline fallback, not the live AI provider. */
    private boolean fallback;
}
