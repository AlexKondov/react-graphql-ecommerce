import React from "react";
import PleaseSignIn from "../components/PleaseSignIn";
import Permissions from "../components/Permissions";

class PermissionsPage extends React.Component {
  render() {
    return (
      <PleaseSignIn>
        <Permissions />
      </PleaseSignIn>
    );
  }
}

export default PermissionsPage;
