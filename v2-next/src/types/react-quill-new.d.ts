import type { ComponentType } from "react";

declare module "react-quill-new" {
  export const Quill: any;
  const ReactQuill: ComponentType<any>;
  export default ReactQuill;
}
