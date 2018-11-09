import React from "react";
import PleaseSignIn from "../components/PleaseSignIn";
import OrderList from "../components/OrderList";

class OrdersPage extends React.Component {
  render() {
    return (
      <PleaseSignIn>
        <OrderList id={this.props.query.id} />
      </PleaseSignIn>
    );
  }
}

export default OrdersPage;
