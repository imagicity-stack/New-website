import { useEffect } from 'react';

interface Shortcut {
  keys: string[];
  handler: () => void;
  description?: string;
}

export const useHotkeys = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        const key = event.key.toLowerCase();
        shortcuts.forEach((shortcut) => {
          const match = shortcut.keys.every((shortcutKey) => shortcutKey === key || shortcutKey === event.key.toLowerCase());
          if (match) {
            event.preventDefault();
            shortcut.handler();
          }
        });
      }
      const pressed = event.key.toLowerCase();
      shortcuts.forEach((shortcut) => {
        if (shortcut.keys.length === 1 && shortcut.keys[0] === pressed) {
          shortcut.handler();
        }
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcuts]);
};
