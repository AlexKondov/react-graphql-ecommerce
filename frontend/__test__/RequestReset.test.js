import React from "react";
import { mount } from "enzyme";
import wait from "waait";
import RequestReset, {
  REQUEST_RESET_MUTATION
} from "../components/RequestReset";
import { CURRENT_USER_QUERY } from "../components/User";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem } from "../lib/testUtils";
import toJSON from "enzyme-to-json";

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: "test@example.com" }
    },
    result: {
      data: { requestReset: { message: "success", __typename: "Message" } }
    }
  },
  {
    request: {
      query: CURRENT_USER_QUERY
    },
    result: {
      data: {
        me: {
          id: "",
          email: "",
          name: "",
          permissions: [],
          cart: [],
          __typename: "User"
        }
      }
    }
  }
];

describe("<RequestReset />", () => {
  it("renders and matches snapshot", () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );

    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  xit("calls the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );

    // simulate typing an email
    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "test@example.com" }
    });

    // submit the form
    wrapper.find("form").simulate("submit");

    await wait();
    wrapper.update();

    expect(wrapper.find("p").text()).toContain(
      "Success! Check your email for a reset link!"
    );
  });
});
