package com.gaply.backend.service;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import com.gaply.backend.dto.PaperSearchResultDto;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArxivService {

    private static final String QUERY_PATH = "/api/query";
    private static final String USER_AGENT = "Gaply/1.0 (research-workspace; mailto:gaply@example.com)";

    /** Hard cap on search results regardless of property config. Keeps payload + parse cost predictable. */
    private static final int MAX_SEARCH_LIMIT = 10;

    /** Pre-compiled — avoids re-compiling the same regex on every entry × every field. */
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final Pattern VERSION_SUFFIX = Pattern.compile("v\\d+$");

    /** XmlMapper is thread-safe and expensive to construct — share one instance for the JVM. */
    private static final XmlMapper XML_MAPPER = new XmlMapper();

    private final RestTemplate restTemplate;

    @Value("${gaply.arxiv.base-url:https://export.arxiv.org}")
    private String baseUrl;

    @Value("${gaply.arxiv.search-limit:10}")
    private int searchLimit;

    @Cacheable(
            value = "arxivSearch",
            key = "#query.trim().toLowerCase()",
            condition = "#query != null && !#query.isBlank()")
    public List<PaperSearchResultDto> search(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        String trimmed = query.trim();
        String searchExpr = buildSearchExpression(trimmed);
        int effectiveLimit = Math.min(Math.max(searchLimit, 1), MAX_SEARCH_LIMIT);

        URI uri = UriComponentsBuilder.fromUriString(baseUrl)
                .path(QUERY_PATH)
                .queryParam("search_query", searchExpr)
                .queryParam("max_results", effectiveLimit)
                .queryParam("sortBy", "relevance")
                .queryParam("sortOrder", "descending")
                .encode()
                .build()
                .toUri();

        log.debug("arXiv search → {}", uri);

        byte[] body = fetchFeed(uri, "search query='" + trimmed + "'");
        ArxivFeed feed = parseFeed(body, "search query='" + trimmed + "'");
        List<ArxivEntry> entries = feed.getEntries() == null
                ? Collections.emptyList()
                : feed.getEntries();

        log.info("arXiv search ← total={} returned={} bytes={} query='{}'",
                feed.getTotalResults() == null ? "?" : feed.getTotalResults(),
                entries.size(),
                body == null ? 0 : body.length,
                trimmed);

        return entries.stream()
                .filter(Objects::nonNull)
                .map(this::toDto)
                .filter(Objects::nonNull)
                .toList();
    }

    // Spring auto-skips caching empty Optionals returned from @Cacheable methods,
    // so no `unless` clause is needed — fewer SpEL surfaces to break.
    @Cacheable(
            value = "arxivPaper",
            key = "#paperId",
            condition = "#paperId != null && !#paperId.isBlank()")
    public Optional<PaperSearchResultDto> getById(String paperId) {
        if (paperId == null || paperId.isBlank()) {
            log.warn("arXiv getById called with blank id");
            return Optional.empty();
        }

        String cleanId = stripVersion(paperId.trim());
        log.debug("arXiv getById start id='{}' (cleaned from '{}')", cleanId, paperId);

        URI uri = UriComponentsBuilder.fromUriString(baseUrl)
                .path(QUERY_PATH)
                .queryParam("id_list", cleanId)
                .encode()
                .build()
                .toUri();

        log.debug("arXiv getById → {}", uri);

        byte[] body = fetchFeed(uri, "id='" + cleanId + "'");

        ArxivFeed feed = parseFeed(body, "id='" + cleanId + "'");
        List<ArxivEntry> entries = feed.getEntries() == null
                ? Collections.emptyList()
                : feed.getEntries();

        log.info("arXiv getById ← entries={} bytes={} id='{}'",
                entries.size(), body == null ? 0 : body.length, cleanId);

        return entries.stream()
                .filter(Objects::nonNull)
                .map(this::toDto)
                .filter(Objects::nonNull)
                .findFirst();
    }

    /* ---------------------- Internals ---------------------- */

    private byte[] fetchFeed(URI uri, String context) {
        try {
            // byte[] avoids a redundant UTF-8 decode pass — XmlMapper reads bytes directly,
            // detecting encoding from the XML declaration itself.
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    new HttpEntity<>(buildHeaders()),
                    byte[].class);
            return response.getBody();
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("arXiv rate-limited (429) for {}. Body: {}", context, e.getResponseBodyAsString());
            throw new ArxivException(
                    "arXiv is rate-limiting requests right now. Please wait a few seconds and try again.",
                    HttpStatus.TOO_MANY_REQUESTS, e);
        } catch (HttpClientErrorException e) {
            log.error("arXiv client error {} for {}. Body: {}",
                    e.getStatusCode(), context, e.getResponseBodyAsString());
            throw new ArxivException(
                    "arXiv returned " + e.getStatusCode().value() + ".",
                    HttpStatus.BAD_GATEWAY, e);
        } catch (RestClientException e) {
            log.error("arXiv transport error for {}: {}", context, e.getMessage());
            throw new ArxivException(
                    "Couldn't reach arXiv. Please try again in a moment.",
                    HttpStatus.BAD_GATEWAY, e);
        }
    }

    private ArxivFeed parseFeed(byte[] body, String context) {
        if (body == null || body.length == 0) {
            log.warn("arXiv returned an empty body for {}", context);
            return new ArxivFeed();
        }
        try {
            ArxivFeed feed = XML_MAPPER.readValue(body, ArxivFeed.class);
            return feed == null ? new ArxivFeed() : feed;
        } catch (Exception e) {
            log.error("Failed to parse arXiv Atom feed for {}: {}", context, e.getMessage());
            throw new ArxivException(
                    "arXiv returned an unexpected response shape.",
                    HttpStatus.BAD_GATEWAY, e);
        }
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_XML, MediaType.APPLICATION_ATOM_XML));
        headers.set(HttpHeaders.USER_AGENT, USER_AGENT);
        return headers;
    }

    private String buildSearchExpression(String query) {
        // Multi-word queries → phrase search for better precision.
        // Single word → plain field-prefixed term.
        return query.contains(" ")
                ? "all:\"" + query + "\""
                : "all:" + query;
    }

    private PaperSearchResultDto toDto(ArxivEntry entry) {
        // Hard-wrap everything: a single bad entry must never break the response.
        if (entry == null) return null;
        try {
            String arxivId = extractArxivId(entry.getId());
            if (arxivId == null) {
                log.warn("arXiv entry has no usable id; raw id='{}'", entry.getId());
                return null;
            }

            List<String> authorNames = Optional.ofNullable(entry.getAuthors())
                    .orElse(Collections.emptyList())
                    .stream()
                    .filter(Objects::nonNull)
                    .map(ArxivAuthor::getName)
                    .filter(Objects::nonNull)
                    .map(ArxivService::normalizeWhitespace)
                    .filter(Objects::nonNull)
                    .toList();

            String htmlUrl = Optional.ofNullable(entry.getLinks())
                    .orElse(Collections.emptyList())
                    .stream()
                    .filter(Objects::nonNull)
                    .filter(l -> "alternate".equals(l.getRel()) || "text/html".equals(l.getType()))
                    .map(ArxivLink::getHref)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse("https://arxiv.org/abs/" + arxivId);

            return PaperSearchResultDto.builder()
                    .id(arxivId)
                    .title(normalizeWhitespace(entry.getTitle()))
                    .abstractText(normalizeWhitespace(entry.getSummary()))
                    .authors(authorNames)
                    .year(extractYear(entry.getPublished()))
                    .url(htmlUrl)
                    .journal(normalizeWhitespace(entry.getJournalRef()))
                    .doi(normalizeWhitespace(entry.getDoi()))
                    .build();
        } catch (Exception e) {
            log.warn("Failed to map arXiv entry id='{}': {}", entry.getId(), e.getMessage());
            return null;
        }
    }

    private static String extractArxivId(String idUrl) {
        if (idUrl == null || idUrl.isBlank()) return null;
        int lastSlash = idUrl.lastIndexOf('/');
        String idPart = lastSlash >= 0 ? idUrl.substring(lastSlash + 1) : idUrl;
        return stripVersion(idPart);
    }

    private static String stripVersion(String id) {
        if (id == null) return null;
        // arXiv ids look like "2105.05233v2" or "cs.AI/0501020v1" — strip trailing vN.
        return VERSION_SUFFIX.matcher(id).replaceFirst("");
    }

    private static Integer extractYear(String iso) {
        if (iso == null || iso.length() < 4) return null;
        try {
            return Integer.parseInt(iso.substring(0, 4));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String normalizeWhitespace(String s) {
        if (s == null) return null;
        String collapsed = WHITESPACE.matcher(s).replaceAll(" ").trim();
        return collapsed.isEmpty() ? null : collapsed;
    }

    /* ---------------------- Atom DTOs ---------------------- */

    @Data
    @JacksonXmlRootElement(localName = "feed")
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ArxivFeed {

        @JacksonXmlProperty(localName = "totalResults")
        private Integer totalResults;

        @JacksonXmlElementWrapper(useWrapping = false)
        @JacksonXmlProperty(localName = "entry")
        private List<ArxivEntry> entries;
    }

    /**
     * Only the fields we actually use in {@link #toDto}. Anything else in the entry
     * (e.g. {@code updated}, {@code category}, {@code primary_category}, {@code comment})
     * is skipped by Jackson without allocation thanks to {@code @JsonIgnoreProperties}.
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ArxivEntry {
        private String id;
        private String title;
        private String summary;
        private String published;

        @JacksonXmlProperty(localName = "journal_ref")
        private String journalRef;

        @JacksonXmlProperty(localName = "doi")
        private String doi;

        @JacksonXmlElementWrapper(useWrapping = false)
        @JacksonXmlProperty(localName = "author")
        private List<ArxivAuthor> authors;

        @JacksonXmlElementWrapper(useWrapping = false)
        @JacksonXmlProperty(localName = "link")
        private List<ArxivLink> links;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ArxivAuthor {
        private String name;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ArxivLink {
        @JacksonXmlProperty(isAttribute = true)
        private String href;
        @JacksonXmlProperty(isAttribute = true)
        private String rel;
        @JacksonXmlProperty(isAttribute = true)
        private String type;
    }
}
