import { h, createSignal, createMemo, For } from 'aided-core';
import { CodeSnippet } from '../components/CodeSnippet';

interface User {
  id: number;
  name: string;
  age: number;
}

type SortKey = keyof Omit<User, 'id'>;
type SortDirection = 'asc' | 'desc';

const sortableTableCode = `const [users] = createSignal(initialUsers);
const [sortConfig, setSortConfig] = createSignal({ key: 'name', direction: 'asc' });

const sortedUsers = createMemo(() => {
  const { key, direction } = sortConfig();
  const sorted = [...users()];
  sorted.sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
});

return h.table(
  h.tbody(
    For({ each: sortedUsers, key: (user) => user.id,
      children: (user) => h.tr(h.td(user().name), h.td(user().age))
    })
  )
);`;

const initialUsers: User[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 },
  { id: 4, name: 'Diana', age: 28 },
];

export function SortableUserTable() {
  // 1. State: The raw, unsorted user data
  const [users] = createSignal(initialUsers);

  // 2. State: The current sorting configuration
  const [sortConfig, setSortConfig] = createSignal<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });

  // 3. Derived State: A memo that returns a sorted copy of the users
  const sortedUsers = createMemo(() => {
    const { key, direction } = sortConfig();
    const sorted = [...users()]; // Create a copy to avoid mutating the original
    sorted.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  });

  // --- Event Handler ---
  const handleSort = (key: SortKey) => {
    const currentConfig = sortConfig();
    let direction: SortDirection = 'asc';
    // If clicking the same column, reverse the direction
    if (currentConfig.key === key && currentConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- UI ---
  return h.table({
    classList: {
      'table': true,
      'table--borderless': true,
    },
    'data-testid': 'sortable-table'
  },
    h.thead(
      h.tr(
        h.th({
          onClick: () => handleSort('name'),
          'data-testid': 'table-header-name',
          // 4. Reactive classes for visual feedback
          classList: {
            active: () => sortConfig().key === 'name',
            asc: () => sortConfig().key === 'name' && sortConfig().direction === 'asc',
            desc: () => sortConfig().key === 'name' && sortConfig().direction === 'desc',
          }
        }, 'Name'),
        h.th({
          onClick: () => handleSort('age'),
          'data-testid': 'table-header-age',
          classList: {
            active: () => sortConfig().key === 'age',
            asc: () => sortConfig().key === 'age' && sortConfig().direction === 'asc',
            desc: () => sortConfig().key === 'age' && sortConfig().direction === 'desc',
          }
        }, 'Age')
      )
    ),
    h.tbody(
      // 5. Render the *sorted* list, not the original one
      For({
        each: sortedUsers,
        key: (user) => user.id,
        children: (user) => h.tr(
          { 'data-testid': `table-row-${user().id}` },
          h.td(user().name),
          h.td(user().age)
        )
      })
    ),
    CodeSnippet({ code: sortableTableCode })
  );
}
