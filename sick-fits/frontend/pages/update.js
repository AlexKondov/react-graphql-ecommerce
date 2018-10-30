import React from "react";
import Link from "next/link";
import UpdateItem from "../components/UpdateItem";

class Update extends React.Component {
  render() {
    return <UpdateItem id={this.props.query.id} />;
  }
}

export default Update;
