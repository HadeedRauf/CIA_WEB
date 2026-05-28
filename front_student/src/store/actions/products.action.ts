import axios from "axios";
import Cookies from "js-cookie";
import { IProduct, ProductModificationStatus } from "../models/product.interface";

export const ADD_PRODUCT: string = "ADD_PRODUCT";
export const EDIT_PRODUCT: string = "EDIT_PRODUCT";
export const REMOVE_PRODUCT: string = "REMOVE_PRODUCT";
export const CHANGE_PRODUCT_AMOUNT: string = "CHANGE_PRODUCT_AMOUNT";
export const CHANGE_PRODUCT_PENDING_EDIT: string = "CHANGE_PRODUCT_PENDING_EDIT";
export const CLEAR_PRODUCT_PENDING_EDIT: string = "CLEAR_PRODUCT_PENDING_EDIT";
export const SET_MODIFICATION_STATE: string = "SET_MODIFICATION_STATE";
export const GET_PRODUCTS: string = "GET_PRODUCTS";

const instance = axios.create({
    baseURL: 'http://' + process.env.REACT_APP_API_URL,
    timeout: 5000,
    headers: {}
});

export function getProducts(): any {
    return async (dispatch: any) => {
        try {
            const response = await instance.get('/product');
            return dispatch({ type: GET_PRODUCTS, products: response.data });
        } catch (e) {
            console.log(e);
        }
    }
}

export function addProduct(product: IProduct): any {
    return async (dispatch: any) => {
        try {
            await instance.post('/product', product, {
                headers: { auth: Cookies.get('token') }
            });
            return dispatch({ type: ADD_PRODUCT, product: product });
        } catch (e) {
            console.log(e);
        }
    }
}

export function editProduct(product: IProduct): any {
    return async (dispatch: any) => {
        try {
            await instance.patch('/product/' + product.id, product, {
                headers: { auth: Cookies.get('token') }
            });
            return dispatch({ type: EDIT_PRODUCT, product: product });
        } catch (e) {
            console.log(e);
        }
    }
}

export function removeProduct(id: number): any {
    return async (dispatch: any) => {
        try {
            await instance.delete('/product/' + id, {
                headers: { auth: Cookies.get('token') }
            });
            return dispatch({ type: REMOVE_PRODUCT, id: id });
        } catch (e) {
            console.log(e);
        }
    }
}

export function changeProductAmount(id: number, amount: number): IChangeProductAmountType {
    return { type: CHANGE_PRODUCT_AMOUNT, id: id, amount: amount };
}

export function changeSelectedProduct(product: IProduct): IChangeSelectedProductActionType {
    return { type: CHANGE_PRODUCT_PENDING_EDIT, product: product };
}

export function clearSelectedProduct(): IClearSelectedProductActionType {
    return { type: CLEAR_PRODUCT_PENDING_EDIT };
}

export function setModificationState(value: ProductModificationStatus): ISetModificationStateActionType {
    return { type: SET_MODIFICATION_STATE, value: value };
}

interface IChangeSelectedProductActionType { type: string, product: IProduct };
interface IClearSelectedProductActionType { type: string };
interface ISetModificationStateActionType { type: string, value: ProductModificationStatus };
interface IChangeProductAmountType { type: string, id: number, amount: number };
