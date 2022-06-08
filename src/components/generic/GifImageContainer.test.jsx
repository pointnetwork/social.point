import React from "react";
import renderer from 'react-test-renderer';

import GifImageContainer from './GifImageContainer';

import image from "../../assets/header-pic.jpg"

describe("GifImageContainer", () => {

    it('should render', () => {
        const component = renderer.create(
            <GifImageContainer src={image}/>
        )
        expect(component.toJSON()).toMatchSnapshot();
    });

});