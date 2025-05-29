// Declarações globais para VLibras
declare global {
  interface Window {
    VLibras: {
      Widget: new (url: string) => void;
    };
  }
}

// Extensões para elementos DOM
declare global {
  interface Element {
    dataset: DOMStringMap;
    style: CSSStyleDeclaration;
    click(): void;
  }
}

export {};
