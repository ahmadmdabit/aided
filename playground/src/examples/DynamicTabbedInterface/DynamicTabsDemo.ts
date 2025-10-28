import { h, createSignal, createMemo, untrack } from 'aided-core'; // 1. Import untrack
import { HomeTab } from './HomeTab';
import { ProfileTab } from './ProfileTab';
import { SettingsTab } from './SettingsTab';
import { TabButton } from './TabButton';

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

  // 3. THE CORE PATTERN: Create a memo that returns the rendered component.
  // This memo re-runs ONLY when `activeTab` changes.
  const ActiveComponent = createMemo(() => {
    const tabName = activeTab(); // This dependency IS tracked
    console.log("ActiveComponent", tabName);
    // a. Look up the component function from our map.
    const ComponentToRender = TABS[tabName];
    // b. Execute the function to get the DOM nodes.
    // 2. THE FIX: Execute the child component inside `untrack`
    return untrack(() => ComponentToRender());
  });

  return h.div(
    { class: 'tabs-container' },
    h.header(
      { class: 'tab-nav' },
      // Render the tab buttons dynamically
      Object.keys(TABS).map((tabName) =>
        TabButton({
          label: tabName.charAt(0).toUpperCase() + tabName.slice(1),
          onClick: () => setActiveTab(tabName),
          isActive: () => activeTab() === tabName
        })
      )
    ),
    h.main(
      { class: 'tab-content' },
      // 4. Render the output of the memo. Aided knows how to handle a memo
      // that returns a DOM node, and it will automatically replace the
      // content when the memo re-evaluates.
      ActiveComponent
    )
  );
}
