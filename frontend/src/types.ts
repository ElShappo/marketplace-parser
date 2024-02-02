import {SVGProps} from "react";
import { availableMarketplaces, availableProperties } from "./constants";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
export type Property = typeof availableProperties[number]

export interface IMarketplace {
  name: typeof availableMarketplaces[number]
  properties: Set<Property> | Property[]
}

export interface IProduct {
  id: number | string
  name: string
  marketplaces: IMarketplace[]
}

export interface IProductExtended extends IProduct {
  intrinsicId: number | string
  isEdited: boolean
}

export type ProductRef = {
  intrinsicId: number | string
  id: number | string
  name: string
}