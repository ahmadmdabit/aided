import { h } from 'aided-core';

export function TabButton(props) {
  const { label, onClick, isActive } = props;
  return h.button(
    {
      onClick: onClick,
      // Reactively apply the 'active' class
      classList: { active: isActive }
    },
    label
  );
}