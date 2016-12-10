import 'react-native';
import React from 'react';
import Chat from '../../../app/components/chat.js';
import { UserFactory } from '../../../app/models/user.js';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer.create(
    <Chat navigateTo={() => {}}
          loggedInUser={UserFactory()} />
  );
});
