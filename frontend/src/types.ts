import {SVGProps} from "react";
import { availableMarketplaces } from "./constants";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface IMarketplace {
  name: typeof availableMarketplaces[number]
  link: string | undefined
}

export interface IProduct {
  id: string
  name: string
  marketplaces: IMarketplace[]
}

export interface IProductExtended extends IProduct {
  intrinsicId: string
  isEdited: boolean
}

export type ProductRef = {
  intrinsicId: string
  id: string
  name: string
}

export interface IExcelRow {
  id: string
  name: string
}