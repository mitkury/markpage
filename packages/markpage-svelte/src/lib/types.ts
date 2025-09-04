import type { Component } from 'svelte';
import type { NavigationItem } from 'markpage';

// Component node parsed from markdown
export interface ComponentNode {
  name: string;
  props: Record<string, any>;
  children?: string;
  position: { start: number; end: number };
}

// Component registration options
export interface ComponentOptions {
  defaultProps?: Record<string, any>;
  validate?: (props: Record<string, any>) => boolean | string;
}

// Registered component information
export interface RegisteredComponent {
  component: Component;
  options: ComponentOptions;
}

// Component parsing result
export interface ParsedContent {
  type: 'text' | 'component';
  content: string | ComponentNode;
}

// MarkpageSvelte instance options
export interface MarkpageSvelteOptions {
  enableComponents?: boolean;
  strictMode?: boolean;
}

// Component render context
export interface RenderContext {
  path: string;
  navigation: NavigationItem[];
  content: Record<string, string>;
}