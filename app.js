import { SITE, ARTICLES } from "./articles.js";

const articleBySlug = new Map(ARTICLES.map((article) => [article.slug, article]));

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  document.title = SITE.title;

  if (page === "home") {
    renderHome();
    return;
  }

  if (page === "article") {
    renderArticle();
  }
});

function renderHome() {
  const latestSlot = document.getElementById("latest-article");
  const archiveList = document.getElementById("archive-list");
  const count = document.getElementById("article-count");

  if (!latestSlot || !archiveList || !count) {
    return;
  }

  const ordered = sortArticles(ARTICLES);
  const [latest, ...archive] = ordered;
  count.textContent = `${ordered.length} published piece${ordered.length === 1 ? "" : "s"}`;

  if (latest) {
    latestSlot.replaceChildren(buildLatestArticle(latest));
  }
  archiveList.replaceChildren(...archive.map(buildArchiveItem));
}

function buildLatestArticle(article) {
  const card = document.createElement("article");
  card.className = "latest-article";

  const kicker = document.createElement("p");
  kicker.className = "latest-article__kicker";
  kicker.textContent = buildMetaLabel(article, true);

  const title = document.createElement("h3");
  title.className = "latest-article__title";

  const titleLink = document.createElement("a");
  titleLink.href = articleUrl(article.slug);
  titleLink.textContent = article.title;
  title.appendChild(titleLink);

  const description = document.createElement("p");
  description.className = "latest-article__description";
  description.textContent = article.description;

  const abstractLabel = document.createElement("p");
  abstractLabel.className = "latest-article__label";
  abstractLabel.textContent = "Abstract";

  const footer = document.createElement("div");
  footer.className = "latest-article__footer";

  const date = document.createElement("span");
  date.className = "latest-article__date";
  date.textContent = article.published ? formatDate(article.published) : "Undated";

  const readLink = document.createElement("a");
  readLink.className = "text-link";
  readLink.href = articleUrl(article.slug);
  readLink.textContent = "Read article";

  footer.append(date, readLink);
  card.append(kicker, title, abstractLabel, description, footer);
  return card;
}

function buildArchiveItem(article) {
  const card = document.createElement("article");
  card.className = "archive-item";

  const meta = document.createElement("div");
  meta.className = "archive-item__meta";

  const category = document.createElement("p");
  category.className = "archive-item__kicker";
  category.textContent = article.category;

  const date = document.createElement("p");
  date.className = "archive-item__date";
  date.textContent = article.published ? formatDate(article.published) : "Archive";

  meta.append(category, date);

  const body = document.createElement("div");
  body.className = "archive-item__body";

  const title = document.createElement("h3");
  title.className = "archive-item__title";

  const titleLink = document.createElement("a");
  titleLink.href = articleUrl(article.slug);
  titleLink.textContent = article.title;
  title.appendChild(titleLink);

  const description = document.createElement("p");
  description.className = "archive-item__description";
  description.textContent = article.description;

  const footer = document.createElement("div");
  footer.className = "archive-item__footer";

  const readLink = document.createElement("a");
  readLink.className = "text-link";
  readLink.href = articleUrl(article.slug);
  readLink.textContent = "Read article";

  footer.appendChild(readLink);
  body.append(title, description, footer);
  card.append(meta, body);
  return card;
}

async function renderArticle() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || document.body.dataset.articleSlug;
  const article = slug ? articleBySlug.get(slug) : undefined;

  if (!article) {
    showArticleMessage("Article not found.");
    return;
  }

  document.title = `${article.title} | ${SITE.title}`;
  setArticleHero(article);

  try {
    const response = await fetch(article.sourcePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${article.sourcePath}`);
    }

    const markdown = await response.text();
    const content = document.getElementById("article-content");
    const readingTime = document.getElementById("article-reading-time");

    if (!content || !readingTime) {
      return;
    }

    const prepared = stripLeadingHeading(markdown);
    readingTime.textContent = `${estimateReadingTime(prepared)} min read`;

    const html = window.marked.parse(prepared);
    content.innerHTML = html;
    rewriteContentLinks(content, article);
  } catch (error) {
    console.error(error);
    showArticleMessage("This article could not be loaded.");
  }
}

function setArticleHero(article) {
  const kicker = document.getElementById("article-kicker");
  const title = document.getElementById("article-title");
  const description = document.getElementById("article-description");
  const published = document.getElementById("article-published");
  const sourceLink = document.getElementById("article-source-link");

  if (kicker) {
    kicker.textContent = buildMetaLabel(article, false);
  }
  if (title) {
    title.textContent = article.title;
  }
  if (description) {
    description.textContent = article.description;
  }
  if (published) {
    published.textContent = article.published ? formatDate(article.published) : "Archive note";
  }
  if (sourceLink) {
    sourceLink.href = article.sourcePath;
  }
}

function showArticleMessage(message) {
  const title = document.getElementById("article-title");
  const description = document.getElementById("article-description");
  const content = document.getElementById("article-content");
  const messageBox = document.getElementById("article-message");
  const readingTime = document.getElementById("article-reading-time");
  const sourceLink = document.getElementById("article-source-link");

  if (title) {
    title.textContent = "Article unavailable";
  }
  if (description) {
    description.textContent = "";
  }
  if (content) {
    content.innerHTML = "";
  }
  if (readingTime) {
    readingTime.textContent = "";
  }
  if (sourceLink) {
    sourceLink.hidden = true;
  }
  if (messageBox) {
    messageBox.hidden = false;
    messageBox.textContent = message;
  }
}

function rewriteContentLinks(container, article) {
  for (const link of container.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) {
      continue;
    }

    if (article.linkMap && article.linkMap[href]) {
      link.href = article.linkMap[href];
      link.target = "_blank";
      link.rel = "noreferrer";
      continue;
    }

    if (href.endsWith(".md") && !isAbsoluteUrl(href)) {
      const slug = href.split("/").pop().replace(/\.md$/i, "");
      if (articleBySlug.has(slug)) {
        link.href = articleUrl(slug);
      }
    } else if (isAbsoluteUrl(href)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
  }
}

function stripLeadingHeading(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length && lines[index].trim() === "") {
    index += 1;
  }

  if (index < lines.length && /^#{1,6}\s+/.test(lines[index])) {
    lines.splice(index, 1);
    if (index < lines.length && lines[index].trim() === "") {
      lines.splice(index, 1);
    }
  }

  return lines.join("\n").trim();
}

function estimateReadingTime(markdown) {
  const words = markdown
    .replace(/[`#>*_()[\]]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function articleUrl(slug) {
  const article = articleBySlug.get(slug);
  if (article && article.permalink) {
    return article.permalink;
  }
  return `./article.html?slug=${encodeURIComponent(slug)}`;
}

function isAbsoluteUrl(value) {
  return /^(?:[a-z]+:)?\/\//i.test(value);
}

function sortArticles(articles) {
  return [...articles].sort((left, right) => {
    const featuredDelta = Number(right.featured) - Number(left.featured);
    if (featuredDelta !== 0) {
      return featuredDelta;
    }

    const publishedDelta = publishedValue(right) - publishedValue(left);
    if (publishedDelta !== 0) {
      return publishedDelta;
    }

    return left.title.localeCompare(right.title);
  });
}

function publishedValue(article) {
  return article.published ? Date.parse(article.published) : 0;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function buildMetaLabel(article, includeLatest) {
  if (includeLatest && article.featured) {
    return `${article.category}  •  Latest`;
  }
  return article.category;
}
