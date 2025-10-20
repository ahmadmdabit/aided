import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot, Fragment, Portal } from './../index';

describe('Aided Structural Components', () => {
  let root: HTMLElement;
  let disposeRoot: () => void;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    if (disposeRoot) {
      disposeRoot();
    }
    root.remove();
  });

  describe('Fragment', () => {
    it('should group multiple children without a wrapper element', () => {
      const p = document.createElement('p');
      const span = document.createElement('span');

      const fragment = Fragment({ children: [p, span] });
      root.appendChild(fragment);

      // The children should be direct descendants of the root
      expect(root.innerHTML).toBe('<p></p><span></span>');
      expect(root.children.length).toBe(2);
      expect(root.children[0].tagName).toBe('P');
      expect(root.children[1].tagName).toBe('SPAN');
    });
  });

  describe('Portal', () => {
    let portalTarget: HTMLElement;

    beforeEach(() => {
      portalTarget = document.createElement('div');
      portalTarget.id = 'portal-target';
      document.body.appendChild(portalTarget);
    });

    afterEach(() => {
      portalTarget.remove();
    });

    it('should render children into a different mount node', () => {
      disposeRoot = createRoot(() => {
        const p = document.createElement('p');
        p.textContent = 'Portaled Content';

        const portal = Portal({
          mount: portalTarget,
          children: p,
        });

        // The portal itself is just a comment node in the original tree
        root.appendChild(portal);
      });

      // The original root should only contain the comment
      expect(root.innerHTML).toBe('<!--portal-->');
      // The portal target should contain the actual content
      expect(portalTarget.innerHTML).toBe('<p>Portaled Content</p>');
    });

    it('should clean up the portaled content when the root is disposed', () => {
      disposeRoot = createRoot(() => {
        const p = document.createElement('p');
        p.textContent = 'Portaled Content';

        const portal = Portal({
          mount: portalTarget,
          children: p,
        });
        root.appendChild(portal);
      });

      expect(portalTarget.innerHTML).toBe('<p>Portaled Content</p>');

      // Dispose the root where the Portal was created
      disposeRoot();

      // The content in the portal target should now be gone
      expect(portalTarget.innerHTML).toBe('');
    });
  });
});
