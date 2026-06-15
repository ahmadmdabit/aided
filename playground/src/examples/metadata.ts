export interface ExampleMetadata {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string[];
  concepts: string[];
  estimatedTime: string;
  relatedExamples: string[];
  learningObjectives: string[];
  codeSnippet?: string;
  tags: string[];
}

export const exampleMetadata: Record<string, ExampleMetadata> = {
  'Home': {
    title: 'Getting Started',
    description: 'Introduction to Aided\'s hyperscript API and basic concepts',
    difficulty: 'beginner',
    category: ['Basics', 'Introduction'],
    concepts: ['hyperscript', 'h function', 'children', 'attributes'],
    estimatedTime: '10 min',
    relatedExamples: ['Counter', 'Signup Form'],
    learningObjectives: [
      'Understand the h() hyperscript function',
      'Learn how to create elements with attributes and children',
      'See basic reactivity concepts'
    ],
    tags: ['basics', 'introduction', 'hyperscript', 'fundamentals']
  },
  'Counter': {
    title: 'Reactive Counter',
    description: 'Demonstrates basic signal usage and event handling',
    difficulty: 'beginner',
    category: ['Basics', 'Reactivity'],
    concepts: ['createSignal', 'event handlers', 'reactive text nodes'],
    estimatedTime: '5 min',
    relatedExamples: ['Home', 'Signup Form'],
    learningObjectives: [
      'Create and use reactive signals',
      'Handle user events with reactive updates',
      'Understand automatic DOM updates'
    ],
    codeSnippet: `const [count, setCount] = createSignal(0);

const counter = h.button(
  { onClick: () => setCount(count() + 1) },
  'Count: ', count
);`,
    tags: ['signals', 'events', 'reactivity', 'basics']
  },
  'Signup Form': {
    title: 'Form with Validation',
    description: 'Complete form example with Model binding and validation',
    difficulty: 'intermediate',
    category: ['Forms', 'Validation'],
    concepts: ['Model', 'createSignal', 'validation', 'form handling'],
    estimatedTime: '15 min',
    relatedExamples: ['Counter', 'Todo List'],
    learningObjectives: [
      'Use Model for two-way data binding',
      'Implement form validation',
      'Handle form submission and state'
    ],
    tags: ['forms', 'validation', 'model', 'binding']
  },
  'Sortable User Table': {
    title: 'Data Table with Sorting',
    description: 'Advanced table component with sorting and filtering',
    difficulty: 'advanced',
    category: ['Lists', 'Data'],
    concepts: ['For', 'sorting', 'derived state', 'complex state'],
    estimatedTime: '20 min',
    relatedExamples: ['Todo List', 'Virtual List'],
    learningObjectives: [
      'Implement complex list operations',
      'Use derived state for computed values',
      'Handle user interactions with data'
    ],
    tags: ['tables', 'sorting', 'data', 'advanced']
  },
  'Spinner': {
    title: 'Loading Spinner',
    description: 'Animated loading component with CSS transitions',
    difficulty: 'beginner',
    category: ['UI Components', 'Animation'],
    concepts: ['CSS animations', 'component composition', 'styling'],
    estimatedTime: '8 min',
    relatedExamples: ['Theme Switcher', 'Modal'],
    learningObjectives: [
      'Create reusable UI components',
      'Use CSS for animations and styling',
      'Understand component composition'
    ],
    tags: ['ui', 'animation', 'css', 'components']
  },
  'Todo List': {
    title: 'Task Management App',
    description: 'Full-featured todo application with CRUD operations',
    difficulty: 'intermediate',
    category: ['Apps', 'CRUD'],
    concepts: ['complex state', 'list operations', 'Model binding', 'derived state'],
    estimatedTime: '25 min',
    relatedExamples: ['Signup Form', 'Sortable User Table'],
    learningObjectives: [
      'Build complete applications with Aided',
      'Manage complex application state',
      'Implement CRUD operations'
    ],
    tags: ['app', 'crud', 'state', 'complex']
  },
  'Theme Switcher': {
    title: 'Context & Theming',
    description: 'Theme switching with context API and CSS variables',
    difficulty: 'advanced',
    category: ['Context', 'Theming'],
    concepts: ['createContext', 'provide', 'useContext', 'CSS variables'],
    estimatedTime: '18 min',
    relatedExamples: ['Modal', 'Weather Widget'],
    learningObjectives: [
      'Use the context API for global state',
      'Implement theming systems',
      'Share state across component trees'
    ],
    tags: ['context', 'theming', 'global-state', 'advanced']
  },
  'Modal': {
    title: 'Modal Dialog',
    description: 'Accessible modal component with portal rendering',
    difficulty: 'intermediate',
    category: ['UI Components', 'Accessibility'],
    concepts: ['Portal', 'conditional rendering', 'accessibility', 'event handling'],
    estimatedTime: '15 min',
    relatedExamples: ['Theme Switcher', 'Notification'],
    learningObjectives: [
      'Create accessible UI components',
      'Use Portal for DOM positioning',
      'Handle complex user interactions'
    ],
    tags: ['modal', 'portal', 'accessibility', 'ui']
  },
  'Notification': {
    title: 'Toast Notifications',
    description: 'Animated notification system with auto-dismissal',
    difficulty: 'advanced',
    category: ['UI Components', 'Animation'],
    concepts: ['effects', 'timers', 'animation', 'lifecycle management'],
    estimatedTime: '20 min',
    relatedExamples: ['Modal', 'Toaster'],
    learningObjectives: [
      'Implement complex animations',
      'Use effects for side effects',
      'Manage component lifecycle and cleanup'
    ],
    tags: ['notifications', 'animation', 'effects', 'lifecycle']
  },
  'Toaster': {
    title: 'Notification System',
    description: 'Complete toast notification system with queue management',
    difficulty: 'advanced',
    category: ['Apps', 'State Management'],
    concepts: ['complex state', 'effects', 'resource management', 'queue logic'],
    estimatedTime: '30 min',
    relatedExamples: ['Notification', 'Dynamic Tabs'],
    learningObjectives: [
      'Build complex state management systems',
      'Implement queue-based logic',
      'Handle asynchronous operations'
    ],
    tags: ['notifications', 'queue', 'async', 'advanced']
  },
  'Dynamic Tabs': {
    title: 'Dynamic Tab Interface',
    description: 'Tabs that can be added/removed with isolated component state',
    difficulty: 'advanced',
    category: ['Apps', 'State Isolation'],
    concepts: ['untrack', 'dynamic components', 'state isolation', 'complex interactions'],
    estimatedTime: '25 min',
    relatedExamples: ['Toaster', 'Weather Widget'],
    learningObjectives: [
      'Use untrack for state isolation',
      'Handle dynamic component creation',
      'Manage complex component lifecycles'
    ],
    tags: ['tabs', 'untrack', 'isolation', 'dynamic']
  },
  'Weather Widget': {
    title: 'Async Data Widget',
    description: 'Weather widget with API calls and loading states',
    difficulty: 'advanced',
    category: ['Async', 'APIs'],
    concepts: ['createResource', 'async operations', 'loading states', 'error handling'],
    estimatedTime: '22 min',
    relatedExamples: ['Dynamic Tabs', 'Theme Switcher'],
    learningObjectives: [
      'Handle asynchronous data with resources',
      'Implement loading and error states',
      'Work with external APIs'
    ],
    tags: ['async', 'api', 'resource', 'loading']
  },
  'Virtual List': {
    title: 'Virtual Scrolling',
    description: 'High-performance virtualized list for large datasets',
    difficulty: 'advanced',
    category: ['Performance', 'Lists'],
    concepts: ['createVirtualizer', 'performance', 'large datasets', 'scrolling'],
    estimatedTime: '20 min',
    relatedExamples: ['Sortable User Table', 'Todo List'],
    learningObjectives: [
      'Implement virtual scrolling for performance',
      'Handle large datasets efficiently',
      'Understand performance optimization techniques'
    ],
    tags: ['virtual', 'performance', 'scrolling', 'optimization']
  }
};

export const categories = [
  'All',
  'Basics',
  'Reactivity',
  'Forms',
  'Lists',
  'UI Components',
  'Apps',
  'Context',
  'Async',
  'Performance'
] as const;

export const difficulties = [
  'all',
  'beginner',
  'intermediate',
  'advanced'
] as const;

export type Category = typeof categories[number];
export type Difficulty = typeof difficulties[number];