import { Home } from './Home';
import { Counter } from './Counter';
import { DynamicTabsDemo } from './DynamicTabbedInterface/DynamicTabsDemo';
import { ModalDemo } from './Modal/ModalDemo';
import { NotificationDemo } from './NotificationSystem/NotificationDemo';
import { ToasterDemo } from './NotificationSystem/ToasterDemo';
import { SignupForm } from './SignupForm';
import { SortableUserTable } from './SortableUserTable';
import { Spinner } from './Spinner';
import { ThemeSwitcher } from './ThemeSwitcher/ThemeSwitcher';
import { TodoList } from './TodoList';
import { VirtualForDemo } from './VirtualForDemo';
import { WeatherWidget } from './WeatherWidget/WeatherWidget';

/**
 * A map of example names to their component functions.
 * The keys will be used as labels in the sidebar.
 */
export const examples = {
  'Home': Home,
  'Counter': Counter,
  'Signup Form': SignupForm,
  'Sortable User Table': SortableUserTable,
  'Spinner': Spinner,
  'Todo List': TodoList,
  'Theme Switcher': ThemeSwitcher,
  'Modal': ModalDemo,
  'Notification': NotificationDemo,
  'Toaster': ToasterDemo,
  'Dynamic Tabs': DynamicTabsDemo,
  'Weather Widget': WeatherWidget,
  'Virtual List': VirtualForDemo,
};
