package com.gaply.backend.service;

import java.util.Collections;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.gaply.backend.dto.AuthorDto;
import com.gaply.backend.dto.CitationGenerateRequestDto;
import com.gaply.backend.dto.CitationsResponseDto;
import com.gaply.backend.dto.PaperDto;

@Service
public class CitationService {

    public String generate(PaperDto paper, String style) {
        return generate(
                paper.getTitle(),
                paper.getAuthors().stream().map(AuthorDto::getName).toList(),
                paper.getPublishedYear(),
                paper.getJournal(),
                paper.getDoi(),
                style);
    }

    public CitationsResponseDto generateAll(CitationGenerateRequestDto request) {
        List<String> names = request.getAuthors() == null
                ? Collections.emptyList()
                : request.getAuthors();
        int year = request.getYear() == null ? 0 : request.getYear();

        return CitationsResponseDto.builder()
                .apa(apa(request.getTitle(), names, year, request.getJournal(), request.getDoi()))
                .mla(mla(request.getTitle(), names, year, request.getJournal(), request.getDoi()))
                .chicago(chicago(request.getTitle(), names, year, request.getJournal(), request.getDoi()))
                .build();
    }

    public String generate(
            String title,
            List<String> names,
            int year,
            String journal,
            String doi,
            String style) {
        String normalized = style == null ? "APA" : style.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "MLA" -> mla(title, names, year, journal, doi);
            case "CHICAGO" -> chicago(title, names, year, journal, doi);
            case "BIBTEX" -> bibtex(title, names, year, journal, doi);
            default -> apa(title, names, year, journal, doi);
        };
    }

    private String apa(String title, List<String> names, int year, String journal, String doi) {
        String authors = names.isEmpty()
                ? "Unknown"
                : names.size() == 1
                ? names.get(0)
                : names.size() == 2
                ? names.get(0) + " & " + names.get(1)
                : names.get(0) + " et al.";
        return String.format("%s (%d). %s. %s. %s",
                authors, year, title, nullSafeJournal(journal), doiUrl(doi)).trim();
    }

    private String mla(String title, List<String> names, int year, String journal, String doi) {
        String authors = names.isEmpty()
                ? "Unknown"
                : names.size() == 1 ? names.get(0) : names.get(0) + ", et al.";
        return String.format("%s. \"%s.\" %s, %d. %s",
                authors, title, nullSafeJournal(journal), year, doiUrl(doi)).trim();
    }

    private String chicago(String title, List<String> names, int year, String journal, String doi) {
        String authors = names.isEmpty() ? "Unknown" : String.join(", ", names);
        return String.format("%s. \"%s.\" %s (%d). %s",
                authors, title, nullSafeJournal(journal), year, doiUrl(doi)).trim();
    }

    private String bibtex(String title, List<String> names, int year, String journal, String doi) {
        String firstSurname = names.isEmpty()
                ? "paper"
                : lastWord(names.get(0)).toLowerCase(Locale.ROOT);
        String authors = String.join(" and ", names);
        return String.format("""
                @article{%s%d,
                  title   = {%s},
                  author  = {%s},
                  journal = {%s},
                  year    = {%d},
                  doi     = {%s}
                }""",
                firstSurname,
                year,
                title,
                authors,
                nullSafeJournal(journal),
                year,
                doi == null ? "" : doi);
    }

    private String doiUrl(String doi) {
        return doi == null || doi.isBlank() ? "" : "https://doi.org/" + doi;
    }

    private String nullSafeJournal(String journal) {
        return journal == null || journal.isBlank() ? "Unknown Journal" : journal;
    }

    private String lastWord(String s) {
        String[] parts = s.trim().split("\\s+");
        return parts[parts.length - 1];
    }
}
