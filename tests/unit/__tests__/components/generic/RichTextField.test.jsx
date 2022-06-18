import React from "react";
import renderer from 'react-test-renderer';

import RichTextField from '../../../../../src/components/generic/RichTextField';


function createNodeMock(element) {
    return document.createElement('input')
}


describe("RichTextField", () => {

    it('should render', () => {
        const options = {createNodeMock};
        const component = renderer.create(
            <RichTextField/>,
            options
        )
        expect(component.toJSON()).toMatchSnapshot();
    });

});