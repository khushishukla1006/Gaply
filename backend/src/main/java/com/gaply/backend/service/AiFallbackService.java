package com.gaply.backend.service;

import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.gaply.backend.dto.ResearchGapResponseDto;

/**
 * Offline fallback for AI features. Produces deterministic, plausible-sounding
 * insights so the demo keeps working when the AI provider is unavailable
 * (quota exhausted, missing key, network errors, etc.).
 *
 * Responses are intentionally generic enough to work for any research paper but
 * personalized with the title so they don't feel canned.
 */
@Service
public class AiFallbackService {

    private static final Set<String> STOPWORDS = Set.of(
            "the", "and", "for", "with", "from", "this", "that", "into", "using",
            "based", "toward", "towards", "novel", "deep", "neural", "models",
            "model", "learning", "paper", "study", "approach", "method", "methods",
            "framework", "system", "systems", "analysis", "survey", "review");

    private static final List<String> LIMITATIONS_TEMPLATES = List.of(
            "Evaluation appears limited to a small set of benchmark datasets, leaving open questions about real-world generalization.",
            "Several design choices look empirically motivated and lack a deeper theoretical justification.",
            "Computational cost scales unfavorably with input size, which could limit practical deployment.",
            "Reproducibility depends on hyperparameter and seed choices that the abstract does not fully enumerate.");

    private static final List<String> UNEXPLORED_BASE = List.of(
            "Robustness under distribution shift and adversarial inputs is not systematically tested.",
            "Cross-domain transfer to settings beyond the evaluated tasks remains an open question.",
            "Interpretability of the learned representations is not explored in depth.",
            "Interactions with adjacent techniques in the broader literature are not characterized.");

    private static final List<String> FUTURE_TEMPLATES = List.of(
            "Extending the approach to streaming or online-learning settings where data arrives sequentially.",
            "Combining it with retrieval-augmented methods to improve factual grounding and reduce hallucination.",
            "Investigating scaling behavior across larger model and dataset sizes to study emergent properties.",
            "Studying failure modes systematically — adversarial, long-tail, and out-of-distribution — to guide architectural refinements.");

    public ResearchGapResponseDto researchGapFallback(String title, String abstractText) {
        String safeTitle = safe(title, "this paper");
        String topic = extractTopic(safeTitle);

        String summary = buildSummary(safeTitle, topic, abstractText);

        // Topic-aware tweak on one of the "unexplored areas" entries.
        String topicalLine = "Cross-domain transfer beyond " + topic
                + " is not deeply characterized in the abstract.";
        List<String> unexplored = List.of(
                UNEXPLORED_BASE.get(0),
                topicalLine,
                UNEXPLORED_BASE.get(2));

        return ResearchGapResponseDto.builder()
                .simplifiedSummary(summary)
                .limitations(LIMITATIONS_TEMPLATES)
                .unexploredAreas(unexplored)
                .futureOpportunities(FUTURE_TEMPLATES)
                .fallback(true)
                .build();
    }

    public String chatFallback(String title, String question) {
        String safeTitle = safe(title, "this paper");
        String q = question == null ? "" : question.toLowerCase(Locale.ROOT);

        if (containsAny(q, "summar", "tl;dr", "tldr", "short")) {
            return "In short, \"" + safeTitle + "\" introduces an approach that the authors claim "
                    + "improves on prior baselines for the problem described in the abstract. They combine a clear "
                    + "architectural idea with careful empirical evaluation, and report gains on standard benchmarks.";
        }
        if (containsAny(q, "contribut", "main", "key idea", "novel")) {
            return "Based on the abstract, the main contributions of \"" + safeTitle + "\" appear to be: "
                    + "(1) a new method or formulation that targets a known limitation in prior work, "
                    + "(2) empirical validation across the benchmarks the authors care about, and "
                    + "(3) analysis or ablations that help isolate which components actually matter.";
        }
        if (containsAny(q, "method", "how it works", "approach", "architect")) {
            return "At a high level, the paper starts from a recognizable baseline and replaces a key component "
                    + "with a more principled alternative. The training procedure is standard, but the architectural "
                    + "or algorithmic change is what unlocks the reported improvements. The abstract doesn't go deep "
                    + "into implementation — that detail typically lives in the methods section.";
        }
        if (containsAny(q, "limit", "weakness", "fail", "drawback", "concern")) {
            return "Common limitations for work in this area include: narrow benchmark coverage, sensitivity to "
                    + "hyperparameter choices, scaling cost, and unclear generalization beyond the tested distribution. "
                    + "The abstract of \"" + safeTitle + "\" doesn't enumerate these explicitly, but they're worth probing "
                    + "in the full paper.";
        }
        if (containsAny(q, "gap", "unexplored", "open question", "future")) {
            return "Promising directions following from \"" + safeTitle + "\": evaluating under distribution shift, "
                    + "exploring multi-modal or cross-domain extensions, and combining the method with retrieval-augmented "
                    + "approaches. These are commonly under-explored in the immediate follow-up literature for papers like this.";
        }
        if (containsAny(q, "result", "performance", "benchmark", "accuracy", "score")) {
            return "The abstract frames the results as competitive with — or improving on — prior baselines on the "
                    + "benchmarks the authors evaluate. Without the full paper, the exact numbers, datasets, and "
                    + "statistical significance aren't visible here, but the framing suggests the gains are meaningful enough "
                    + "to publish.";
        }
        if (containsAny(q, "related", "compare", "vs ", "versus", "prior")) {
            return "The paper positions itself relative to established baselines in the area. Without the related-work "
                    + "section, the most useful comparison points are the methods cited in the abstract — those represent "
                    + "the work the authors most want to be compared against.";
        }

        return "That's a great question about \"" + safeTitle + "\". Based on the abstract alone, I'd note the "
                + "authors' framing of the problem and their headline contribution. For a deeper answer, the relevant "
                + "section of the full paper would have the specifics — the abstract is a summary by design.";
    }

    /* ---------------------- internals ---------------------- */

    private String buildSummary(String title, String topic, String abstractText) {
        String snippet = "";
        if (abstractText != null && !abstractText.isBlank()) {
            String firstSentence = abstractText.split("(?<=\\.)\\s+", 2)[0].trim();
            if (firstSentence.length() > 220) {
                firstSentence = firstSentence.substring(0, 217) + "…";
            }
            // Lower-case the first letter to slot it into the rest of the sentence.
            if (!firstSentence.isEmpty()) {
                firstSentence = Character.toLowerCase(firstSentence.charAt(0)) + firstSentence.substring(1);
                snippet = " The work centers on " + firstSentence;
            }
        }
        return "\"" + title + "\" investigates " + topic + " and presents an approach that the authors "
                + "validate empirically against prior work."
                + snippet
                + " The contribution is positioned as both methodological and empirical.";
    }

    private String extractTopic(String title) {
        for (String w : title.split("\\s+")) {
            String clean = w.replaceAll("[^a-zA-Z]", "").toLowerCase(Locale.ROOT);
            if (clean.length() > 4 && !STOPWORDS.contains(clean)) {
                return clean;
            }
        }
        return "the problem area";
    }

    private static boolean containsAny(String haystack, String... needles) {
        for (String n : needles) {
            if (haystack.contains(n)) return true;
        }
        return false;
    }

    private static String safe(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value.trim();
    }
}
