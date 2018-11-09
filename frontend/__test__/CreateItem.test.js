import React from "react";
import { mount } from "enzyme";
import wait from "waait";
import CreateItem, { CREATE_ITEM_MUTATION } from "../components/CreateItem";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem } from "../lib/testUtils";
import toJSON from "enzyme-to-json";
import Router from "next/router";
import { fakeItem } from "../lib/testUtils";

const dogImage = "https://dog.com/dog.jpg";

// mock the global fetch API
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: dogImage,
    eager: [{ secure_url: dogImage }]
  })
});

describe("<CreateItem />", () => {
  it("renders and matches snapshot", () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const form = wrapper.find('form[data-test="form"]');

    expect(toJSON(form)).toMatchSnapshot();
  });

  it("uploads a file", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const input = wrapper.find('input[type="file"]');
    input.simulate("change", { target: { files: ["fakedog.jpg"] } });

    await wait();

    const component = wrapper.find("CreateItem").instance();
    expect(component.state.image).toEqual(dogImage);
    expect(component.state.largeImage).toEqual(dogImage);
    expect(global.fetch).toHaveBeenCalled();

    global.fetch.mockReset();
  });

  it("handles state updating", () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    wrapper
      .find("#title")
      .simulate("change", { target: { value: "testing", name: "title" } });
    wrapper.find("#price").simulate("change", {
      target: { value: "500", name: "price", type: "number" }
    });
    wrapper.find("#description").simulate("change", {
      target: { value: "nice item!", name: "description" }
    });

    expect(wrapper.find("CreateItem").instance().state).toMatchObject({
      title: "testing",
      price: 500,
      description: "nice item!"
    });
  });

  it("creates an item after the form is submitted", async () => {
    const item = fakeItem();
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            title: item.title,
            description: item.description,
            image: "",
            largeImage: "",
            price: item.price
          }
        },
        result: {
          data: {
            createItem: {
              ...fakeItem(),
              __typename: "Item"
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );

    // simulate someone filling out the form
    wrapper
      .find("#title")
      .simulate("change", { target: { value: item.title, name: "title" } });
    wrapper.find("#price").simulate("change", {
      target: { value: item.price, name: "price", type: "number" }
    });
    wrapper.find("#description").simulate("change", {
      target: { value: item.description, name: "description" }
    });

    // mock router
    Router.router = { push: jest.fn() };
    wrapper.find("form").simulate("submit");

    await wait(50);
    wrapper.update();

    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/item",
      query: { id: "abc123" }
    });
  });
});
