import type { ComponentType } from 'svelte';
import type { NavigationItem } from 'markpage';
import type { ComponentNode, ComponentOptions, RegisteredComponent, MarkpageSvelteOptions, RenderContext } from './types.js';
import { ComponentParser } from './ComponentParser.js';

/**
 * Main MarkpageSvelte class for managing components and rendering markdown
 */
export class MarkpageSvelte {
  private components = new Map<string, RegisteredComponent>();
  private parser: ComponentParser;
  private options: MarkpageSvelteOptions;

  constructor(
    private navigation: NavigationItem[],
    private content: Record<string, string>,
    options: MarkpageSvelteOptions = {}
  ) {
    this.options = {
      enableComponents: true,
      strictMode: false,
      ...options
    };
    this.parser = new ComponentParser();
  }

  /**
   * Register a component for use in markdown
   */
  addComponent(
    name: string, 
    component: ComponentType, 
    options: ComponentOptions = {}
  ): void {
    if (this.options.strictMode && !this.isValidComponentName(name)) {
      throw new Error(`Invalid component name: ${name}. Component names must start with a capital letter and contain only alphanumeric characters.`);
    }

    this.components.set(name, { component, options });
  }

  /**
   * Remove a registered component
   */
  removeComponent(name: string): boolean {
    return this.components.delete(name);
  }

  /**
   * Get a registered component
   */
  getComponent(name: string): ComponentType | undefined {
    return this.components.get(name)?.component;
  }

  /**
   * Check if a component is registered
   */
  hasComponent(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Get all registered component names
   */
  getRegisteredComponents(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Get content for a specific path
   */
  getContent(path: string): string | undefined {
    return this.content[path];
  }

  /**
   * Get navigation for a specific path
   */
  getNavigation(path: string): NavigationItem | undefined {
    return this.findNavigationItem(this.navigation, path);
  }

  /**
   * Parse content and extract components
   */
  parseContent(content: string): ComponentNode[] {
    if (!this.options.enableComponents) {
      return [];
    }
    return this.parser.extractComponents(content);
  }

  /**
   * Check if content contains components
   */
  hasComponents(content: string): boolean {
    if (!this.options.enableComponents) {
      return false;
    }
    return this.parser.hasComponents(content);
  }

  /**
   * Validate component props against registered component
   */
  validateComponentProps(name: string, props: Record<string, any>): boolean | string {
    const registered = this.components.get(name);
    if (!registered) {
      return `Component '${name}' is not registered`;
    }

    if (registered.options.validate) {
      return registered.options.validate(props);
    }

    return true;
  }

  /**
   * Get default props for a component
   */
  getComponentDefaultProps(name: string): Record<string, any> {
    const registered = this.components.get(name);
    return registered?.options.defaultProps || {};
  }

  /**
   * Get render context for a path
   */
  getRenderContext(path: string): RenderContext {
    return {
      path,
      navigation: this.navigation,
      content: this.content
    };
  }

  /**
   * Validate component name format
   */
  private isValidComponentName(name: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  }

  /**
   * Find navigation item by path
   */
  private findNavigationItem(items: NavigationItem[], path: string): NavigationItem | undefined {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.items) {
        const found = this.findNavigationItem(item.items, path);
        if (found) return found;
      }
    }
    return undefined;
  }
}