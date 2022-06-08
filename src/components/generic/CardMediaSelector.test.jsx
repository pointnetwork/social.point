import React from "react";
import renderer from 'react-test-renderer';

import CardMediaSelector from './CardMediaSelector';

import image from "../../assets/header-pic.jpg"

describe("CardMediaSelector", () => {

    it('should render', () => {
        const component = renderer.create(
            <CardMediaSelector selectedMedia={image} setAlert={jest.fn()}></CardMediaSelector>
        )
        expect(component.toJSON()).toMatchSnapshot();
    });

});