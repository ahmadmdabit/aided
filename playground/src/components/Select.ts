/* eslint-disable @typescript-eslint/no-explicit-any */
import { h, bindAttr } from 'aided-core';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: () => string;
  onChange: (value: string) => void;
  placeholder?: string;
  class?: string;
}

export function Select({ options, value, onChange, placeholder, class: className }: SelectProps) {
  return h.select(
    {
      class: className || 'select-input',
      onChange: (e: any) => onChange(e.target.value),
      ref: (el: HTMLSelectElement) => {
        bindAttr(el, 'value', value);
      }
    },
    placeholder && h.option({ value: '', disabled: true }, placeholder),
    ...options.map(option =>
      h.option({ value: option.value }, option.label)
    )
  );
}
