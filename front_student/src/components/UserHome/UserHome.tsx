import React, { Fragment, useEffect, Dispatch, useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import useSession from "react-session-hook";
import TopCard from "../../common/components/TopCard";
import ProductList from "../Products/ProductsList";
import Notifications from "../../common/components/Notification";
import { IProductState, IStateType } from "../../store/models/root.interface";
import { IProduct } from "../../store/models/product.interface";
import { getProducts } from "../../store/actions/products.action";
import { addNotification } from "../../store/actions/notifications.action";
import { logout } from "../../store/actions/account.actions";
import { updateCurrentPath } from "../../store/actions/root.actions";

const UserHome: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const history = useHistory();
  const session = useSession();
  const products: IProductState = useSelector((state: IStateType) => state.products);
  const [orderName, setOrderName] = useState("");
  const [orderAmount, setOrderAmount] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(0);

  const numberItemsCount: number = products.products.length;
  const totalProductAmount: number = products.products.reduce(
    (prev, next) => prev + (Number(next.amount) || 0),
    0,
  );

  function onLogout(): void {
    Cookies.remove("token");
    session.removeSession();
    dispatch(logout());
    history.push("/login");
  }

  function createOrder(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token) {
      dispatch(addNotification("Error", "Session expired"));
      onLogout();
      return;
    }

    if (!orderName || selectedProductId <= 0 || orderAmount <= 0) {
      dispatch(addNotification("Error", "Please fill all order fields"));
      return;
    }

    axios
      .post(
        "http://" + process.env.REACT_APP_API_URL + "/order",
        {
          name: orderName,
          productId: selectedProductId,
          amount: orderAmount,
        },
        {
          headers: { auth: token },
        },
      )
      .then(() => {
        dispatch(addNotification("Success", "Order created"));
        setOrderName("");
        setOrderAmount(1);
        setSelectedProductId(0);
      })
      .catch((error) => {
        const message =
          (error && error.response && error.response.data) ||
          (error && error.message) ||
          "Failed to create order";
        dispatch(addNotification("Error", message));
      });
  }

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      session.removeSession();
      dispatch(logout());
      history.push("/login");
      return;
    }

    axios
      .get("http://" + process.env.REACT_APP_API_URL + "/auth/me", {
        headers: { auth: token },
      })
      .then((response) => {
        const user = response.data && response.data.user ? response.data.user : null;
        if (!user) {
          dispatch(addNotification("Error", "Session expired"));
          session.removeSession();
          dispatch(logout());
          history.push("/login");
          return;
        }
        if (user.role === "ADMIN") {
          history.push("/");
          return;
        }
        dispatch(updateCurrentPath("user", "home"));
        dispatch(getProducts());
      })
      .catch(() => {
        dispatch(addNotification("Error", "Session expired"));
        session.removeSession();
        dispatch(logout());
        history.push("/login");
      });
  }, [dispatch, history, session]);

  return (
    <Fragment>
      <Notifications />
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h1 className="h3 mb-0 text-gray-800">User Dashboard</h1>
          <button className="btn btn-outline-secondary" onClick={onLogout}>Logout</button>
        </div>
        <p className="mb-4">You can view product inventory.</p>

        <div className="row">
          <TopCard title="PRODUCT COUNT" text={`${numberItemsCount}`} icon="box" class="primary" />
          <TopCard title="PRODUCT AMOUNT" text={`${totalProductAmount}`} icon="warehouse" class="danger" />
        </div>

        <div className="row">
          <div className="col-xl-12 col-lg-12">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-green">Create Order</h6>
              </div>
              <div className="card-body">
                <form onSubmit={createOrder}>
                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label htmlFor="user_order_name">Order Name</label>
                      <input
                        id="user_order_name"
                        className="form-control"
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="user_order_product">Product</label>
                      <select
                        id="user_order_product"
                        className="form-control"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(Number(e.target.value))}
                      >
                        <option value={0}>Choose...</option>
                        {products.products.map((product: IProduct) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-md-2">
                      <label htmlFor="user_order_amount">Amount</label>
                      <input
                        id="user_order_amount"
                        type="number"
                        min={1}
                        className="form-control"
                        value={orderAmount}
                        onChange={(e) => setOrderAmount(Number(e.target.value) || 1)}
                      />
                    </div>
                    <div className="form-group col-md-2 d-flex align-items-end">
                      <button type="submit" className="btn btn-success btn-block">Create</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-xl-12 col-lg-12">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-green">Product List</h6>
              </div>
              <div className="card-body">
                <ProductList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UserHome;