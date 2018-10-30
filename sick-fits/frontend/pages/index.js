import React from "react";
import Link from "next/link";
import Items from "../components/Items";

class Home extends React.Component {
  render() {
    return <Items page={parseFloat(this.props.query.page)} />;
  }
}

export default Home;
