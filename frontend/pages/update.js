import React from "react";
import UpdateItem from "../components/UpdateItem";

class Update extends React.Component {
  render() {
    return <UpdateItem id={this.props.query.id} />;
  }
}

export default Update;
