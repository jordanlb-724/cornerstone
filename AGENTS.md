# AGENTS.md

This file provides comprehensive guidance for AI agents working with the BC-Hera-Rhino Stencil theme repository.

## Project Overview

This is a BigCommerce Stencil theme project for Rhino Rails, an e-commerce site specializing in warehouse safety products (guardrails, bollards, rack protectors, etc.). The theme is built on BigCommerce's Stencil framework and uses modern web technologies.

## Tech Stack

- **Framework**: BigCommerce Stencil
- **Languages**: JavaScript, SCSS, Handlebars templates
- **CSS Framework**: Tailwind CSS v3
- **Build Tools**: Webpack, Grunt, Babel
- **Testing**: Jest
- **Package Manager**: npm

## Essential Commands

### Development

```bash
npm run stencil-start        # Start development server
npm run openWarm            # Start with browser auto-open
npm run tailwind-v3:watch   # Watch Tailwind CSS changes
```

### Building & Bundling

```bash
npm run build               # Build project with webpack
npm run tailwind-v3:build   # Build Tailwind CSS
npm run stencil-bundle      # Bundle theme for deployment
npm run stencil-push        # Push theme to BigCommerce
npm run stencil-push:sourcemaps  # Push with sourcemaps
```

### Code Quality

```bash
npm run eslint-check        # Check JavaScript linting
npm run eslint-fix          # Auto-fix JavaScript issues
npm run stylelint-check     # Check CSS/SCSS linting
npm run stylelint-fix       # Auto-fix CSS/SCSS issues
npm run prettier-write-js   # Format JavaScript files
npm run prettier-write-scss # Format SCSS files
npm run prettier-write-html # Format HTML/Handlebars files
npm run test               # Run Jest tests
```

## Project Structure

```
/
├── assets/               # Frontend assets
│   ├── js/              # JavaScript files
│   │   ├── app.js       # Main entry point
│   │   └── theme/       # Theme-specific modules
│   ├── scss/            # SCSS stylesheets
│   │   ├── theme.scss   # Main theme styles
│   │   ├── checkout.scss # Checkout styles
│   │   └── tailwind.scss # Tailwind imports
│   ├── icons/           # SVG icons
│   └── img/             # Images
├── templates/           # Handlebars templates
│   ├── components/      # Reusable components
│   ├── layout/          # Layout templates
│   └── pages/           # Page templates
├── lang/                # Localization files
├── config.json          # Theme configuration
├── schema.json          # Theme settings schema
└── package.json         # Dependencies and scripts
```

## Code Style Guidelines

### JavaScript

- **Quotes**: Use single quotes for strings
- **Indentation**: 4 spaces
- **Semicolons**: Always required
- **Variables**: Use `const` by default, `let` when reassignment needed, avoid `var`
- **Naming**: camelCase for variables/functions, PascalCase for classes/components
- **Error Handling**: Use try/catch blocks for async operations

### SCSS

- **Property Order**: Follow this grouping:
    1. Positioning (position, top, z-index)
    2. Box Model (display, width, margin, padding)
    3. Typography (font, color, text-align)
    4. Visual (background, border, opacity)
    5. Animation (transition, animation)
- **Nesting**: Maximum 3 levels deep
- **Variables**: Use SCSS variables for colors, spacing, breakpoints

### Handlebars Templates

- **Formatting**: Consistent indentation (4 spaces)
- **Comments**: Use `{{!-- comment --}}` syntax
- **Helpers**: Leverage built-in Stencil helpers
- **Data**: Access via `{{this}}`, `{{@root}}`, etc.

## Important Patterns & Conventions

### Module Pattern

JavaScript modules follow this structure:

```javascript
import utils from '@bigcommerce/stencil-utils';

export default class ModuleName {
    constructor(element) {
        this.$element = $(element);
        this.bindEvents();
    }

    bindEvents() {
        // Event bindings
    }
}
```

### Page Manager Pattern

Page-specific code extends PageManager:

```javascript
import PageManager from './page-manager';

export default class ProductPage extends PageManager {
    onReady() {
        // Page initialization
    }
}
```

### Tailwind Usage

- Build custom utilities in `tailwind.config.js`
- Use `@apply` directive sparingly in SCSS
- Prefer utility classes in templates
- Custom components go in `assets/scss/nerden/` or `assets/scss/halothemes/`

## Working with BigCommerce APIs

### Stencil Utils

Use `@bigcommerce/stencil-utils` for API calls:

```javascript
import utils from '@bigcommerce/stencil-utils';

utils.api.cart.getCart({}, (err, response) => {
    // Handle response
});
```

### Available APIs

- Cart API
- Product API
- Customer API
- Country/State API
- Product Attributes API

## Testing Approach

- Unit tests use Jest
- Test files follow `*.test.js` naming
- Mock Stencil utilities when needed
- Focus on business logic testing
- Run specific tests: `npx jest path/to/test.js`

## Common Tasks

### Adding a New Page Template

1. Create template in `templates/pages/`
2. Add route in `config.json`
3. Create corresponding JavaScript in `assets/js/theme/`
4. Import and register in `assets/js/app.js`

### Creating a Component

1. Add Handlebars template in `templates/components/`
2. Create SCSS in appropriate directory
3. Add JavaScript if interactive
4. Document usage in comments

### Modifying Theme Settings

1. Update `schema.json` for new settings
2. Use in templates via `{{theme_settings.setting_name}}`
3. Add translations in `schemaTranslations.json`

## Performance Considerations

- Lazy load images using responsive-img component
- Minimize JavaScript bundle size
- Use Webpack code splitting where appropriate
- Optimize SCSS output (avoid duplicates)
- Leverage browser caching

## Debugging Tips

- Use `{{log}}` helper in templates
- Chrome DevTools for JavaScript debugging
- BigCommerce Preview Inspector for data
- Check browser console for Stencil errors
- Use `npm run stencil-start` for hot reload

## Deployment Process

1. Run all linters and fix issues
2. Build and test locally
3. Bundle theme: `npm run stencil-bundle`
4. Push to store: `npm run stencil-push`
5. Test on preview/staging first

## Important Files to Know

- `CLAUDE.md` - Instructions for Claude AI
- `config.json` - Theme configuration and routes
- `schema.json` - Theme customization options
- `package.json` - Dependencies and npm scripts
- `webpack.*.js` - Build configuration
- `tailwind.config.js` - Tailwind customization
- `.stencil` - Local development configuration

## Common Pitfalls to Avoid

1. Don't modify core Stencil files directly
2. Avoid inline styles - use Tailwind or SCSS
3. Don't hardcode store-specific data
4. Remember to test responsive designs
5. Check browser compatibility
6. Validate Handlebars syntax before bundling
7. Don't commit `.stencil` file (contains API credentials)

## Getting Help

- BigCommerce Developer Documentation: https://developer.bigcommerce.com/
- Stencil CLI Documentation: https://github.com/bigcommerce/stencil-cli
- Theme Documentation: Check internal docs in `_Other/` directory
- For project-specific questions: Reference CLAUDE.md

## Working Effectively

1. Always run linters before committing
2. Test changes across different pages/templates
3. Consider mobile-first approach
4. Use semantic HTML and accessibility best practices
5. Keep bundle sizes minimal
6. Document complex logic with comments
7. Follow existing patterns in the codebase
