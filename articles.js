export const SITE = {
  title: "Working Notes",
  description: "Research writing by a KInIT research engineer.",
};

export const ARTICLES = [
  {
    slug: "field-notes-the-urge-to-outsource-judgment",
    title: "Tiny Court and the urge to outsource judgment",
    description:
      "A philosophical look at petty arbitration, AI judges, and why comic authority can teach restraint.",
    category: "Field notes",
    published: "2026-06-15",
    featured: true,
    permalink: "./tiny-court-and-the-urge-to-outsource-judgment.html",
    coverImage: "./assets/promo-walkthrough.webp",
    coverAlt: "Tiny Court promo walkthrough showing the courtroom interface and generated court record.",
    sourcePath: "./articles/field-notes-the-urge-to-outsource-judgment.md",
    linkMap: {
      "design-spec.md": "https://github.com/Johnz86/tiny-court/blob/main/docs/design-spec.md",
    },
  },
  {
    slug: "competitive-over-automation",
    title: "Competitive Over-Automation and Demand Externalities",
    description:
      "A short note on automation incentives, aggregate demand, and why firm-level logic can misfire at system scale.",
    category: "Economics",
    featured: false,
    permalink: "./competitive-over-automation.html",
    sourcePath: "./articles/competitive-over-automation.md",
  },
  {
    slug: "decoding-content-sequences-and-algorithmic-interaction",
    title: "Decoding Content Sequences and Algorithmic Interaction",
    description:
      "Notes on content embeddings, recommendation sequences, and what platform behavior data does and does not show.",
    category: "Media systems",
    featured: false,
    permalink: "./decoding-content-sequences-and-algorithmic-interaction.html",
    sourcePath: "./articles/decoding-content-sequences-and-algorithmic-interaction.md",
  },
  {
    slug: "generative-agent-based-modeling",
    title: "Behavioral Archetypes and Synthetic Collective Logic in Social Modeling",
    description:
      "A compact overview of generative agent modeling, archetypes, and meso-scale social simulation.",
    category: "Research note",
    featured: false,
    permalink: "./generative-agent-based-modeling.html",
    sourcePath: "./articles/generative-agent-based-modeling.md",
  },
  {
    slug: "the-case-for-deflationism",
    title: "The Case for Deflationism: Why Language Models Are Just Next Token Predictors",
    description:
      "An argument for a deflationary view of language models, centered on training objectives, robustness, and anthropomorphism.",
    category: "AI theory",
    featured: false,
    permalink: "./the-case-for-deflationism.html",
    sourcePath: "./articles/the-case-for-deflationism.md",
  },
];
