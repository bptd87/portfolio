import type { ComponentType } from "react";

declare module "recharts" {
  export type LegendProps = any;

  export const ResponsiveContainer: ComponentType<any>;
  export const PieChart: ComponentType<any>;
  export const Pie: ComponentType<any>;
  export const Cell: ComponentType<any>;
  export const Legend: ComponentType<any>;
  export const BarChart: ComponentType<any>;
  export const Bar: ComponentType<any>;
  export const XAxis: ComponentType<any>;
  export const YAxis: ComponentType<any>;
  export const CartesianGrid: ComponentType<any>;
  export const Tooltip: ComponentType<any>;
}
