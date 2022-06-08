import React from "react";
import renderer from 'react-test-renderer';

import UserAvatar from './UserAvatar';

describe("UserAvatar", () => {

    it('should render', () => {
        const component = renderer.create(
            <UserAvatar user={{}} address="0x12345679ABCDEF" upperLoading={false} setAlert={jest.fn()} props={{}}></UserAvatar>
        )
        expect(component.toJSON()).toMatchSnapshot();
    });

});