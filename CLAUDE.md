# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands
- Development: `pnpm dev`
- Build: `pnpm build`
- Format: `pnpm format`
- Serve: `pnpm serve`
- Clean: `pnpm clean`
- Deploy: `pnpm deploy`

## Code Style Guidelines
- Formatting: Use Prettier with default config
- React components: Functional components with hooks
- CSS: SCSS modules with BEM naming convention (bt--component--element)
- Image handling: Use Gatsby Image components for optimization
- Imports: Group imports (React, Gatsby, components, styles)
- Error handling: Use conditional rendering for missing data
- File structure: Follow Gatsby conventions for pages, components, and templates
- GraphQL queries: Co-locate with components using page/static queries
- Theme handling: Support dark/light modes via gatsby-plugin-dark-mode