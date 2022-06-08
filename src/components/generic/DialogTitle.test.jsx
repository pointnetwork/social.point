import React from "react";
import renderer from 'react-test-renderer';

import DialogTitle from './DialogTitle';

describe("DialogTitle", () => {

    it('should render', () => {
        const component = renderer.create(
            <DialogTitle classes={{}} children={<div></div>} onClose={jest.fn()} other={{}}></DialogTitle>
        )
        expect(component.toJSON()).toMatchSnapshot();
    });

});