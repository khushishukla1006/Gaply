package com.gaply.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.gaply.backend.dto.CitationDto;
import com.gaply.backend.dto.PaperDto;
import com.gaply.backend.dto.PaperSearchResultDto;
import com.gaply.backend.service.ArxivException;
import com.gaply.backend.service.ArxivService;
import com.gaply.backend.service.CitationService;
import com.gaply.backend.service.PaperService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/papers")
@RequiredArgsConstructor
public class PaperController {

    private final PaperService paperService;
    private final CitationService citationService;
    private final ArxivService arxivService;

    @GetMapping
    public List<PaperDto> getAll() {
        return paperService.getAll();
    }

    @GetMapping("/search")
    public List<PaperSearchResultDto> search(@RequestParam("q") String query) {
        return arxivService.search(query);
    }

    // `{id:.+}` ensures dots inside arXiv ids like "2405.03150" are not treated
    // as file extensions by intermediate URL parsers.
    @GetMapping("/external/{id:.+}")
    public PaperSearchResultDto getExternalById(@PathVariable String id) {
        log.info("getExternalById id='{}'", id);
        return arxivService.getById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paper not found"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaperDto> getById(@PathVariable String id) {
        return paperService.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/citation")
    public ResponseEntity<CitationDto> getCitation(
            @PathVariable String id,
            @RequestParam(value = "style", defaultValue = "APA") String style) {
        return paperService.getById(id)
                .map(paper -> ResponseEntity.ok(
                        CitationDto.builder()
                                .style(style)
                                .citation(citationService.generate(paper, style))
                                .build()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @ExceptionHandler(ArxivException.class)
    public ResponseEntity<Map<String, Object>> handleArxiv(ArxivException e) {
        return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getMessage()));
    }

    // ResponseStatusException carries its own HTTP status (e.g. 404 from /external/{id}).
    // Surface it as a uniform { "error": "..." } JSON body so the frontend can display it.
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException e) {
        String reason = e.getReason() != null ? e.getReason() : "Error";
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", reason));
    }

    // Catch-all: any other unhandled exception is logged with full stack trace
    // and returned as 502 with a clean message, never as a bare 500.
    @ExceptionHandler(Throwable.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Throwable t) {
        log.error("Unhandled error in PaperController", t);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", "Something went wrong handling your request. Check the server logs."));
    }
}
