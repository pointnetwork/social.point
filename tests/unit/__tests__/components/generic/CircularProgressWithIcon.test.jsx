import React from "react";
import renderer from 'react-test-renderer';

import CircularProgressWithIcon from '../../../../../src/components/generic/CircularProgressWithIcon';

import AddPhotoAlternateOutlinedIcon from '@material-ui/icons/AddPhotoAlternateOutlined';

describe("CircularProgressWithIcon", () => {

    it('should render', () => {
        const component = renderer.create(
            <CircularProgressWithIcon icon={<AddPhotoAlternateOutlinedIcon/>}></CircularProgressWithIcon>
        )
        expect(component.toJSON()).toMatchSnapshot();
    });

});