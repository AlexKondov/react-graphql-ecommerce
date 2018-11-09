import React from "react";
import PleaseSignIn from "../components/PleaseSignIn";
import Order from "../components/Order";

class OrderPage extends React.Component {
  render() {
    return (
      <PleaseSignIn>
        <Order id={this.props.query.id} />
      </PleaseSignIn>
    );
  }
}

export default OrderPage;
