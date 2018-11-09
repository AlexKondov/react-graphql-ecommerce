import React from "react";
import { mount } from "enzyme";
import wait from "waait";
import NProgress from "nprogress";
import TakeMyMoney, { CREATE_ORDER_MUTATION } from "../components/TakeMyMoney";
import { CURRENT_USER_QUERY } from "../components/User";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem } from "../lib/testUtils";
import toJSON from "enzyme-to-json";
import { ApolloConsumer } from "react-apollo";
import Router from "next/router";
import { check } from "graphql-anywhere";

Router.router = {
  push: jest.fn()
};

NProgress.start = jest.fn();

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem()]
        }
      }
    }
  }
];

describe("<TakeMyMoney />", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    const checkoutButton = wrapper.find("ReactStripeCheckout");
    expect(toJSON(checkoutButton)).toMatchSnapshot();
  });

  it("creates an order ontoken", async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: { id: "xyz789" }
      }
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );

    const component = wrapper.find("TakeMyMoney").instance();

    // manually call that ontoken method
    component.onToken({ id: "abc123" }, createOrderMock);

    expect(createOrderMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalledWith({
      variables: { token: "abc123" }
    });
  });

  it("turns the progress bar on", async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: { id: "xyz789" }
      }
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );

    const component = wrapper.find("TakeMyMoney").instance();

    // manually call that ontoken method
    component.onToken({ id: "abc123" }, createOrderMock);

    expect(NProgress.start).toHaveBeenCalled();
  });

  it("routes to the order page when completed", () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: { id: "xyz789" }
      }
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    );

    const component = wrapper.find("TakeMyMoney").instance();

    // manually call that ontoken method
    component.onToken({ id: "abc123" }, createOrderMock);
    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/order",
      query: { id: "xyz789" }
    });
  });
});
