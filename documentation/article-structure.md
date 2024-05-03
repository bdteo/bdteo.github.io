# Article Structure

This document outlines the structure for creating new articles for this blog.

## Directory Structure

Each new article must have its own directory within the `content/blog` directory. The directory name should be a slug of the article title (e.g., `this-is-a-new-article`).

Each article directory must contain:

*   `index.md`: The markdown file containing the article's content.
*   `images/`: A directory to store all images associated with the article.

## Markdown Frontmatter

The `index.md` file for each article must begin with a YAML frontmatter block. This block contains metadata about the article. The following fields are required:

*   **`title`**: The title of the article.
*   **`date`**: The publication date of the article in `YYYY-MM-DD` format.
*   **`description`**: A brief summary of the article's content.
*   **`tags`**: A list of relevant tags for the article.
*   **`featuredImage`**: The path to the article's featured image. This should be a relative path to an image in the `images` directory (e.g., `./images/featured.jpg`).
*   **`imageCaption`**: A caption for the featured image.

### Example Frontmatter

```yaml
---
title: "This is a New Article"
date: "2025-07-15"
description: "A brief description of the new article."
tags: ["new", "article", "example"]
featuredImage: "./images/featured.jpg"
imageCaption: "A caption for the featured image."
---
```
