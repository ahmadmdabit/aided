import { h } from 'aided-core';

export function TabButton(props) {
  const { label, onClick, isActive, 'data-testid': testId } = props;
  return h.button(
    {
      onClick: onClick,
      'data-testid': testId,
      // Reactively apply the 'active' class
      classList: { active: isActive }
    },
    label
  );
}