import {SVGProps} from "react";
import { marketplaces, metadata } from "./constants";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Marketplace = typeof marketplaces[number]
export type Property = typeof metadata[number]

export type Product = {
  id: number | string
  name: string
  marketplaces: Marketplace[]
  properties: Property[]
}