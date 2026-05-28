import { IOrdersState, IActionBase } from "../models/root.interface";
import { ADD_ORDER, GET_ORDERS, REMOVE_ORDER, EDIT_ORDER } from "../actions/orders.actions";

const initialState: IOrdersState = {
    orders: []
};

function orderReducer(state: IOrdersState = initialState, action: IActionBase): IOrdersState {
    switch (action.type) {
        case GET_ORDERS: {
            return { ...state, orders: action.orders };
        }
        case ADD_ORDER: {
            let maxId: number = Math.max.apply(Math, state.orders.map((o) => { return o.id; }));
            if (maxId === -Infinity) { maxId = 0; }
            return { ...state, orders: [...state.orders, { ...action.order, id: maxId + 1 }] };
        }
        case REMOVE_ORDER: {
            return { ...state, orders: state.orders.filter(o => o.id !== action.id) };
        }
        case EDIT_ORDER: {
            const foundIndex: number = state.orders.findIndex(o => o.id === action.order.id);
            let orders = state.orders;
            orders[foundIndex] = action.order;
            return { ...state, orders: orders };
        }
        default:
            return state;
    }
}

export default orderReducer;
