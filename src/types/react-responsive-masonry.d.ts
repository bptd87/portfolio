declare module "react-responsive-masonry" {
  import type { ComponentType, ReactNode } from "react";

  export interface ResponsiveMasonryProps {
    children?: ReactNode;
    columnsCountBreakPoints?: Record<number, number>;
  }

  export interface MasonryProps {
    children?: ReactNode;
    columnsCount?: number;
    gutter?: string | number;
    className?: string;
    style?: React.CSSProperties;
  }

  export const ResponsiveMasonry: ComponentType<ResponsiveMasonryProps>;
  const Masonry: ComponentType<MasonryProps>;
  export default Masonry;
}
