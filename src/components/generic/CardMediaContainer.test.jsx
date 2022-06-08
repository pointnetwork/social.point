import React from "react";
import renderer from 'react-test-renderer';

import CardMediaContainer from './CardMediaContainer';

import image from "../../assets/header-pic.jpg"

describe("CardMediaContainer", () => {

    it('should render', () => {
        const component = renderer.create(
            <CardMediaContainer media={image}></CardMediaContainer>
        )
        expect(component.toJSON()).toMatchSnapshot();
    });

});
