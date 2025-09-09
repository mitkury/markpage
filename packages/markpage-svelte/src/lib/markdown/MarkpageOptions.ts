import type { Component } from 'svelte';
import type { Marked } from 'marked';

export interface MarkdownExtension {
  name: string;
  level: 'block' | 'inline';
  component: Component;
  start(src: string): number | undefined;
  tokenizer(src: string): any;
}

export interface MarkdownExtensionSet {
  extensions: MarkdownExtension[];
}

export class MarkpageOptions {
  private components = new Map<string, Component>();
  private extensionComponents = new Map<string, Component>();
  private markedInstance?: Marked;
  private markedFactory?: () => Marked;

  /**
   * Add a custom component that can be used as a tag in markdown
   */
  addCustomComponent(name: string, component: Component): this {
    this.components.set(name, component);
    return this;
  }

  /**
   * Extend markdown with custom token extensions that include components
   */
  extendMarkdown(extensions: MarkdownExtensionSet | MarkdownExtensionSet[]): this {
    const extensionSets = Array.isArray(extensions) ? extensions : [extensions];
    
    for (const extensionSet of extensionSets) {
      for (const extension of extensionSet.extensions) {
        this.extensionComponents.set(extension.name, extension.component);
      }
    }
    
    return this;
  }

  /**
   * Use a specific Marked instance
   */
  useMarkedInstance(instance: Marked): this {
    this.markedInstance = instance;
    return this;
  }

  /**
   * Use a factory function to create Marked instances
   */
  useMarkedFactory(factory: () => Marked): this {
    this.markedFactory = factory;
    return this;
  }

  /**
   * Get the components map for custom component tags
   */
  getComponents(): Map<string, Component> {
    return this.components;
  }

  /**
   * Get the extension components map for custom tokens
   */
  getExtensionComponents(): Map<string, Component> {
    return this.extensionComponents;
  }

  /**
   * Get the configured Marked instance or create one using the factory
   */
  getMarked(): Marked {
    if (this.markedInstance) {
      return this.markedInstance;
    }
    
    if (this.markedFactory) {
      return this.markedFactory();
    }
    
    // Return undefined to indicate no custom Marked instance is configured
    // The Markdown component will handle creating a default instance
    return undefined as any;
  }

  /**
   * Get all registered extensions for applying to a Marked instance
   */
  getExtensions(): MarkdownExtensionSet[] {
    // This would need to be stored when extendMarkdown is called
    // For now, we'll return an empty array as the extensions are applied
    // by the user when they create their Marked instance
    return [];
  }
}