declare namespace JSX {
  interface IntrinsicAttributes {
    key?: any;
  }

  interface IntrinsicElements {
    [elemName: string]: any;
  }

  interface ElementChildrenAttribute {
    children: {};
  }
}
