import React from "react";
import renderer from 'react-test-renderer';

import EmojiPicker from '../../../../../src/components/generic/EmojiPicker';

describe("EmojiPicker", () => {

    it('should render', () => {
        const component = renderer.create(
            <EmojiPicker></EmojiPicker>
        )
        expect(component.toJSON()).toMatchSnapshot();
    });

});