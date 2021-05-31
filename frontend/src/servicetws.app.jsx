import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./component/home.component";

function ServiceTws() {
    return (
        <Router>
            <Route exact path="/" component={Home} />
        </Router>
    );
}

export default ServiceTws;
