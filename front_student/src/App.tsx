import React from "react";
import "./App.css";
import "./styles/sb-admin-2.min.css";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import Login from "./components/Account/Login";
import Admin from "./components/Admin/Admin";
import UserHome from "./components/UserHome/UserHome";
import Register from "./components/Account/Register";
import {Route} from "react-router";
import {PrivateRoute} from "./common/components/PrivateRoute";
import {UseSessionProvider} from "react-session-hook";

const App: React.FC = () => {
    return (
        <UseSessionProvider>
            <div className="App" id="wrapper">
                <Router>
                    <Switch>
                        <Route exact path="/login">
                            <Login />
                        </Route>
                        <Route exact path={"/register"}>
                            <Register/>
                        </Route>
                        <PrivateRoute exact path="/user-home">
                            <UserHome />
                        </PrivateRoute>
                        <PrivateRoute path="/">
                            <Admin />
                        </PrivateRoute>
                    </Switch>
                </Router>
            </div>
        </UseSessionProvider>
    );
};

export default App;
