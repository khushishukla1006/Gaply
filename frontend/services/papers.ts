import type { Paper } from "@/types";

export const papers: Paper[] = [
  {
    id: "1",
    title:
      "Attention Is All You Need: A Comprehensive Look at Transformer Architectures",
    authors: [
      { id: "a1", name: "Ashish Vaswani", affiliation: "Google Brain" },
      { id: "a2", name: "Noam Shazeer", affiliation: "Google Brain" },
      { id: "a3", name: "Niki Parmar", affiliation: "Google Research" },
    ],
    abstract:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    summary:
      "Introduces the Transformer architecture using only self-attention, achieving state-of-the-art results on translation tasks while being significantly faster to train.",
    tags: ["NLP", "Deep Learning", "Attention", "Transformers"],
    publishedYear: 2017,
    journal: "NeurIPS",
    citations: 98432,
    doi: "10.48550/arXiv.1706.03762",
    aiExplanation:
      "This paper revolutionized NLP by replacing recurrence with attention. Imagine reading a sentence: instead of going word-by-word, you weigh each word's importance to every other word simultaneously. That's self-attention. Transformers became the backbone of GPT, BERT, and modern LLMs.",
    researchGaps: [
      "Quadratic complexity in sequence length limits long-context applications.",
      "Lack of explicit positional reasoning beyond learned embeddings.",
      "Limited interpretability of attention weights as causal explanations.",
    ],
  },
  {
    id: "2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: [
      { id: "a4", name: "Jacob Devlin", affiliation: "Google AI Language" },
      { id: "a5", name: "Ming-Wei Chang", affiliation: "Google AI Language" },
    ],
    abstract:
      "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context.",
    summary:
      "BERT pre-trains a deep bidirectional Transformer on masked language modeling, setting new benchmarks across 11 NLP tasks.",
    tags: ["NLP", "Pre-training", "Transformers", "Language Models"],
    publishedYear: 2018,
    journal: "NAACL",
    citations: 76543,
    doi: "10.48550/arXiv.1810.04805",
    aiExplanation:
      "BERT learns language by playing fill-in-the-blank on huge text corpora. Because it sees both left and right context simultaneously, it builds richer representations than left-to-right models.",
    researchGaps: [
      "Pre-training requires massive compute, limiting accessibility.",
      "Static pre-training data leads to outdated knowledge.",
      "Domain adaptation remains brittle for specialized fields.",
    ],
  },
  {
    id: "3",
    title: "Deep Residual Learning for Image Recognition",
    authors: [
      { id: "a6", name: "Kaiming He", affiliation: "Microsoft Research" },
      { id: "a7", name: "Xiangyu Zhang", affiliation: "Microsoft Research" },
    ],
    abstract:
      "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.",
    summary:
      "Introduces ResNet with skip connections, enabling training of networks with 100+ layers and winning ImageNet 2015.",
    tags: ["Computer Vision", "Deep Learning", "CNN", "Image Recognition"],
    publishedYear: 2015,
    journal: "CVPR",
    citations: 187654,
    doi: "10.48550/arXiv.1512.03385",
    aiExplanation:
      "ResNet's key insight: let layers learn residuals (the difference) rather than full mappings. Skip connections preserve gradient flow, making very deep networks trainable.",
    researchGaps: [
      "Residual blocks are still empirically motivated; theoretical guarantees are limited.",
      "Energy/parameter efficiency lags behind newer architectures like ViT.",
    ],
  },
  {
    id: "4",
    title: "Generative Adversarial Networks",
    authors: [
      { id: "a8", name: "Ian Goodfellow", affiliation: "Université de Montréal" },
    ],
    abstract:
      "We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability that a sample came from the training data rather than G.",
    summary:
      "Introduces GANs: two networks competing in a minimax game, enabling generation of realistic images, audio, and more.",
    tags: ["Generative Models", "Deep Learning", "Computer Vision"],
    publishedYear: 2014,
    journal: "NeurIPS",
    citations: 56789,
    doi: "10.48550/arXiv.1406.2661",
    aiExplanation:
      "Think of a forger and a detective: the forger (generator) creates fake images, the detective (discriminator) tries to spot them. They train together, and the forger gets better and better.",
    researchGaps: [
      "Mode collapse remains a persistent issue.",
      "Training instability requires careful hyperparameter tuning.",
      "Diffusion models have largely overtaken GANs in image generation quality.",
    ],
  },
  {
    id: "5",
    title:
      "Diffusion Models Beat GANs on Image Synthesis",
    authors: [
      { id: "a9", name: "Prafulla Dhariwal", affiliation: "OpenAI" },
      { id: "a10", name: "Alex Nichol", affiliation: "OpenAI" },
    ],
    abstract:
      "We show that diffusion models can achieve image sample quality superior to the current state-of-the-art generative models. We achieve this on unconditional image synthesis by finding a better architecture through a series of ablations.",
    summary:
      "Demonstrates diffusion models surpassing GANs on ImageNet generation, marking a shift in the generative landscape.",
    tags: ["Generative Models", "Diffusion", "Computer Vision"],
    publishedYear: 2021,
    journal: "NeurIPS",
    citations: 8932,
    doi: "10.48550/arXiv.2105.05233",
    aiExplanation:
      "Diffusion models learn to reverse a noising process: start with pure noise, gradually denoise to a real image. This stable training procedure produces sharper, more diverse samples than GANs.",
    researchGaps: [
      "Sampling speed remains slow compared to single-pass GANs.",
      "Conditional control mechanisms are still maturing.",
    ],
  },
  {
    id: "6",
    title: "AlphaFold: Highly accurate protein structure prediction",
    authors: [
      { id: "a11", name: "John Jumper", affiliation: "DeepMind" },
      { id: "a12", name: "Richard Evans", affiliation: "DeepMind" },
    ],
    abstract:
      "Proteins are essential to life, and understanding their structure can facilitate a mechanistic understanding of their function. We present AlphaFold, a neural network model that predicts protein structures with atomic accuracy.",
    summary:
      "AlphaFold achieves near-experimental accuracy in protein structure prediction, a breakthrough for biology.",
    tags: ["Biology", "Deep Learning", "Protein Folding", "Science"],
    publishedYear: 2021,
    journal: "Nature",
    citations: 23456,
    doi: "10.1038/s41586-021-03819-2",
    aiExplanation:
      "Predicting how a protein folds from its amino acid sequence was a 50-year-old grand challenge. AlphaFold uses attention over evolutionary data and geometry to reach atomic-level accuracy.",
    researchGaps: [
      "Multi-protein complexes and dynamics remain harder.",
      "Predictions for orphan proteins (no homologs) are less reliable.",
    ],
  },
];

export function getAllPapers(): Paper[] {
  return papers;
}

export function getPaperById(id: string): Paper | undefined {
  return papers.find((p) => p.id === id);
}

export function searchPapers(query: string): Paper[] {
  if (!query) return papers;
  const q = query.toLowerCase();
  return papers.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.abstract.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.authors.some((a) => a.name.toLowerCase().includes(q))
  );
}
