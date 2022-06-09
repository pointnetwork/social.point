import React from "react";
import renderer from 'react-test-renderer';

import CollapsibleTypography from '../../../../../src/components/generic/CollapsibleTypography';

describe("CollapsibleTypography", () => {

    it('should render', () => {
        const component = renderer.create(
            <CollapsibleTypography content="this is a test" loading={false}/>
        )
        expect(component.toJSON()).toMatchSnapshot();
    });

});