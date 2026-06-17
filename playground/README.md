# Aided Playground

An interactive learning environment for exploring Aided's fine-grained reactivity system.

## Features

### 🎯 **Enhanced Learning Experience**

- **Rich Example Cards**: Each example includes title, description, difficulty level, and key concepts
- **Smart Search & Filtering**: Find examples by concept, category, or difficulty level
- **Detailed Info Panels**: Comprehensive information about each example including learning objectives and code snippets
- **Progressive Disclosure**: Information revealed contextually as you explore
- **Example Metadata System**: Structured metadata for all examples with tags, categories, and difficulty levels

### 📚 **In‑Browser Documentation**

- **Full API Reference**: Automatically generated from source‑code comments and Markdown files
- **Guides and Walkthroughs**: Step‑by‑step explanations of core concepts (e.g., hyperscript helper)
- **Syntax Highlighting**: Code blocks are highlighted with Prism.js for better readability
- **Copy‑to‑Clipboard**: One‑click copy buttons on all code snippets
- **Navigable Sidebar**: Tree‑based navigation of all documentation files
- **Markdown Rendering**: All documentation rendered from Markdown with DOMPurify sanitisation for security

### 🌐 **Client‑Side Routing**

- **SPA Navigation**: Seamless switching between the Playground and Documentation without full page reloads
- **History API Integration**: Browser back/forward buttons work as expected
- **Reactive Route State**: Current path is a signal, enabling fine‑grained updates to the UI

### 📱 **Responsive Design**

- **Mobile-First**: Optimized for all screen sizes from mobile to desktop
- **Adaptive Layout**: Sidebar transforms to grid layout on smaller screens
- **Touch-Friendly**: Large touch targets and swipe gestures
- **Accessibility**: Full keyboard navigation and screen reader support

### 🎨 **Modern UI/UX**

- **Design System**: Consistent spacing, typography, and color scheme
- **Smooth Animations**: Subtle transitions and micro-interactions
- **Visual Hierarchy**: Clear information architecture and content flow
- **Theme Support**: Automatic light/dark mode based on system preferences
- **Enhanced Styling**: Professional CSS with variables and responsive breakpoints

### 🔍 **Discovery & Navigation**

- **Category Organization**: Examples grouped by functionality (Basics, Forms, Lists, etc.)
- **Difficulty Levels**: Beginner, Intermediate, and Advanced examples clearly marked
- **Related Examples**: Suggested learning paths and connections between concepts
- **Search Functionality**: Full-text search across titles, descriptions, and tags
- **Dynamic Component Loading**: Efficient example switching with proper lifecycle management

## Getting Started

```bash
cd playground
yarn install
yarn dev
```

Open `http://localhost:5173` in your browser to explore the playground.

## Example Categories

### 🏗️ **Basics** - Core Concepts

- **Getting Started**: Introduction to hyperscript and basic reactivity
- **Reactive Counter**: Signals, effects, and event handling
- **Signup Form**: Model binding and form validation

### 📝 **Forms & Validation**

- **Form Handling**: Two-way data binding with Model
- **Validation**: Client-side validation patterns
- **Complex Forms**: Multi-step and conditional forms

### 📋 **Lists & Data**

- **Sortable User Table**: Data manipulation and sorting
- **Virtual Scrolling**: Performance optimization for large lists with `VirtualFor`
- **Dynamic Lists**: Adding/removing items reactively
- **Todo List**: Complete CRUD application with filtering and persistence

### 🎨 **UI Components**

- **Modal Dialog**: Portal rendering and accessibility with reusable modal component
- **Toast Notifications**: Animated notification system with enter/leave animations
- **Theme Switcher**: Context API and theming with light/dark mode toggle
- **Spinner**: Loading indicators and async state visualization

### 🚀 **Advanced Patterns**

- **Dynamic Tabs**: Component state isolation with `untrack` for independent tab instances
- **Weather Widget**: Async data with `createResource` and chained API calls
- **Context API**: Global state management without prop drilling
- **Headless Components**: Reusable logic separated from presentation

## Learning Path

The playground is designed to guide you through Aided's concepts progressively:

1. **Start Here**: Begin with "Getting Started" and "Reactive Counter"
2. **Forms**: Learn data binding with "Signup Form"
3. **Data Management**: Explore lists and tables
4. **UI Patterns**: Build reusable components
5. **Advanced**: Master complex state management and async patterns

## Technical Implementation

### Architecture

- **Component-Based**: Each example is a self-contained component
- **Reactive State**: All UI state managed through Aided's signals
- **Performance Optimized**: Virtual scrolling and efficient re-rendering
- **Type-Safe**: Full TypeScript coverage with strict typing
- **Dynamic Loading**: Examples loaded on-demand with proper lifecycle management using `For` component

### Key Technologies

- **Aided Core**: Fine-grained reactivity library
- **Hyperscript**: Declarative UI construction with `h` helper
- **CSS Variables**: Dynamic theming system
- **Modern CSS**: Grid, Flexbox, and custom properties
- **Markdown Rendering**: `marked` + `DOMPurify` + `Prism.js` for safe and styled documentation
- **Client‑Side Router**: Custom signal‑based router for SPA navigation

### New Components

- **ExampleCard**: Rich card component with metadata display
- **InfoPanel**: Detailed information panel with code snippets
- **SearchAndFilter**: Smart search and filtering functionality
- **Multiple App Variants**: Different architectural approaches (simple, enhanced, corrected, final, fixed, working)
- **Documentation System**: Full documentation viewer with sidebar navigation and syntax highlighting

## Contributing

The playground welcomes contributions! To add a new example:

1. Create your component in `src/examples/`
2. Add metadata in `src/examples/metadata.ts` with title, description, difficulty, category, and tags
3. Update the examples registry in `src/examples/index.ts`
4. Add `data-testid` attributes to interactive elements for E2E testing
5. Test across different screen sizes and browsers
6. Consider adding E2E tests in `e2e/tests/examples/`

To add or update documentation:

1. Place Markdown files in `playground/public/documentation/` (any depth)
2. The parser automatically builds a sidebar tree from the file structure
3. Use standard Markdown with fenced code blocks – they will be highlighted and get copy buttons

## Testing

The playground is covered by comprehensive E2E tests using TestCafe. These tests validate:

- All interactive examples work correctly
- Navigation between examples functions properly
- Reactive state updates occur as expected
- Cross-browser compatibility (Chrome, Firefox)

Run E2E tests:

```bash
# From project root
yarn test:e2e

# Chrome only
yarn test:e2e:chrome

# Firefox only
yarn test:e2e:firefox
```

See `e2e/README.md` for detailed testing documentation.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES2020+ features and CSS custom properties support.
