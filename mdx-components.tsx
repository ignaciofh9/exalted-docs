// mdx-components.tsx
import type { MDXComponents } from 'mdx/types';
import defaultComponents from 'fumadocs-ui/mdx';
import { useMemo } from 'react';

declare global {
  interface NodeRequire {
      /** A special feature supported by webpack's compiler that allows you to get all matching modules starting from some base directory.  */
      context: (
          directory: string,
          useSubdirectories: boolean,
          regExp: RegExp
      ) => any;
  }
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const customComponents = useMemo(() => {
    const componentContext = require.context('@/app/components', true, /\.(js|ts|jsx|tsx)$/);
    return componentContext.keys().reduce((acc: Record<string, React.ComponentType<any>>, key: string) => {
      const componentName = key.replace(/^\.\//, '').replace(/\.(js|ts|jsx|tsx)$/, '');
      acc[componentName] = componentContext(key).default;
      return acc;
    }, {});
  }, []);

  return {
    ...defaultComponents,
    ...components,
    ...customComponents,
  };
}