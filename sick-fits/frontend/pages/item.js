import React from "react";
import SingleItem from "../components/SingleItem";

class Item extends React.Component {
  render() {
    return <SingleItem id={this.props.query.id} />;
  }
}

export default Item;
