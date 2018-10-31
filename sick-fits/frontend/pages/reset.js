import React from "react";
import Reset from "../components/Reset";

const reset = props => {
  return <Reset resetToken={props.query.resetToken} />;
};

export default reset;
