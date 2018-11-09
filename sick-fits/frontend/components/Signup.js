import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

export const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
      id
      name
      email
    }
  }
`;

class Signup extends Component {
  state = {
    name: "",
    password: "",
    email: ""
  };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <Mutation
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        mutation={SIGNUP_MUTATION}
        variables={this.state}
      >
        {(signup, { error, loading }) => {
          return (
            <Form
              method="post"
              onSubmit={async e => {
                e.preventDefault();
                const response = await signup();
                this.setState({ name: "", email: "", password: "" });
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Sign Up for an Account</h2>
                <Error error={error} />
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    placehodler="email"
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="name">
                  Name
                  <input
                    type="text"
                    name="name"
                    placehodler="Name"
                    value={this.state.name}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    placehodler="Password"
                    value={this.state.password}
                    onChange={this.saveToState}
                  />
                </label>
                <button type="submit">Sign Up!</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Signup;
