import { h, createSignal, createMemo, untrack } from 'aided-core';
import { HomeTab } from './HomeTab';
import { ProfileTab } from './ProfileTab';
import { SettingsTab } from './SettingsTab';
import { TabButton } from './TabButton';
import { CodeSnippet } from '../../components/CodeSnippet';

const dynamicTabsCode = `const TABS = { home: HomeTab, profile: ProfileTab, settings: SettingsTab };
const [activeTab, setActiveTab] = createSignal<TabName>('home');
const tabInstances = new Map<TabName, Node>();

const ActiveComponent = createMemo(() => {
  const tabName = activeTab();
  if (!tabInstances.has(tabName)) {
    tabInstances.set(tabName, untrack(() => TABS[tabName]()));
  }
  return tabInstances.get(tabName)!;
});

return h.div(
  h.main({ class: 'tab-content' }, ActiveComponent)
);`;

// 1. Create a map from a string identifier to the actual component function.
// This is the key to the pattern: treating components as values.
const TABS = {
  home: HomeTab,
  profile: ProfileTab,
  settings: SettingsTab,
};

type TabName = keyof typeof TABS;

const WIDGET_STYLE_ID = 'aided-modal-demo-styles';

const widgetCSS = `
  .tabs-container { width: 600px; max-width: 600px; margin: 2rem auto; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);  overflow: hidden; }
  .tab-nav { display: flex; background-color: #ccc; color: #333; }
  .tab-nav button { padding: 1rem; border: none; background: #333; cursor: pointer; font-size: 1rem; border-bottom: 3px solid transparent; margin: .2rem; }
  .tab-nav button.active { background-color: rgba(4, 214, 74, 1); }
  .tab-content { padding: 1.5rem; }
`;

function injectDynamicTabsDemoStyles() {
  // 3. Check if the styles are already in the DOM. If so, do nothing.
  if (document.getElementById(WIDGET_STYLE_ID)) {
    return;
  }

  // 4. If not, create the style element and add it.
  const styleElement = h.style(widgetCSS);
  styleElement.id = WIDGET_STYLE_ID;
  document.head.appendChild(styleElement);
}

export function DynamicTabsDemo() {
  injectDynamicTabsDemoStyles();

  // 2. Create a signal to hold the identifier of the currently active tab.
  const [activeTab, setActiveTab] = createSignal<TabName>('home');

  // Cache to store rendered tab instances
  const tabInstances = new Map<TabName, Node>();

  // 3. THE CORE PATTERN: Create a memo that returns the rendered component.
  // This memo re-runs ONLY when `activeTab` changes.
  const ActiveComponent = createMemo(() => {
    const tabName = activeTab(); // This dependency IS tracked
    console.log("ActiveComponent", tabName);
    
    // Check if we already have a rendered instance
    if (!tabInstances.has(tabName)) {
      // Create and cache the instance only once
      const ComponentToRender = TABS[tabName];
      // a. Look up the component function from our map.
      // b. Execute the function to get the DOM nodes.
      // 2. THE FIX: Execute the child component inside `untrack`
      tabInstances.set(tabName, untrack(() => ComponentToRender()));
    }
    
    // Return the cached instance
    return tabInstances.get(tabName)!;
  });

  return h.div(
    { class: 'tabs-container' },
    h.header(
      { class: 'tab-nav' },
      // Render the tab buttons dynamically
      Object.keys(TABS).map((tabName) =>
        TabButton({
          label: tabName.charAt(0).toUpperCase() + tabName.slice(1),
          onClick: () => setActiveTab(tabName as TabName),
          isActive: () => activeTab() === tabName,
          'data-testid': `tab-button-${tabName}`
        })
      )
    ),
    h.main(
      { class: 'tab-content', 'data-testid': 'tab-content' },
      // 4. Render the output of the memo. Aided knows how to handle a memo
      // that returns a DOM node, and it will automatically replace the
      // content when the memo re-evaluates.
      ActiveComponent
    ),
    CodeSnippet({ code: dynamicTabsCode })
  );
}
