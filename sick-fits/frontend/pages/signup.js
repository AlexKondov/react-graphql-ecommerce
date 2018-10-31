import React from "react";
import Signup from "../components/Signup";
import Signin from "../components/Signin";
import RequestReset from "../components/RequestReset";
import styled from "styled-components";

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

class SignupPage extends React.Component {
  render() {
    return (
      <Columns>
        <Signup />
        <Signin />
        <RequestReset />
      </Columns>
    );
  }
}

export default SignupPage;
