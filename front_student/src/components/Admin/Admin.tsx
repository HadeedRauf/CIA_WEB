import React, { Fragment, Dispatch, useEffect } from "react";
import { useDispatch } from "react-redux";
import LeftMenu from "../LeftMenu/LeftMenu";
import TopMenu from "../TopMenu/TopMenu";
import { Switch } from "react-router";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import useSession from "react-session-hook";
import Users from "../Users/Users";
import Home from "../Home/Home";
import Products from "../Products/Products";
import Orders from "../Orders/Orders";
import Notifications from "../../common/components/Notification";
import { PrivateRoute } from "../../common/components/PrivateRoute";
import { getProducts } from "../../store/actions/products.action";
import { getOrders } from "../../store/actions/orders.actions";
import { addNotification } from "../../store/actions/notifications.action";
import { logout } from "../../store/actions/account.actions";

const Admin: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const history = useHistory();
  const session = useSession();

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
        headers: { auth: token }
      })
      .then((response) => {
        const user = response.data && response.data.user ? response.data.user : null;
        if (!user || user.role !== "ADMIN") {
          history.push("/user-home");
          return;
        }
        dispatch(getProducts());
        dispatch(getOrders());
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
      <LeftMenu />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <TopMenu />
          <div className="container-fluid">
            <Switch>
              <PrivateRoute exact path="/users"><Users /></PrivateRoute>
              <PrivateRoute exact path="/products"><Products /></PrivateRoute>
              <PrivateRoute exact path="/orders"><Orders /></PrivateRoute>
              <PrivateRoute exact path="/"><Home /></PrivateRoute>
            </Switch>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Admin;
