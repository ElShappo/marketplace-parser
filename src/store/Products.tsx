import { makeAutoObservable } from "mobx";
import { IProduct } from "../types";

class Products {
  products = [] as IProduct[];
  consturctor() {
    makeAutoObservable(this);
  }
  add(product: IProduct) {
    this.products.push(product);
  }

  // we can pass product (IProduct) or productId (string | number)
  delete(product: IProduct | string | number) {
    if (typeof product === "object") {
      this.products = this.products.filter((pr) => pr.id !== product.id);
    } else {
      this.products = this.products.filter((pr) => pr.id !== product);
    }
  }

  update(product: IProduct | string | number, newProduct: IProduct) {
    let index;
    if (typeof product === "object") {
      index = this.products.findIndex((pr) => pr.id === product.id);
    } else {
      index = this.products.findIndex((pr) => pr.id === product);
    }
    this.products[index] = newProduct;
  }
}

export default new Products();
