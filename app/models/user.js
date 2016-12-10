import React, { PropTypes } from 'react';


export default UserSchema = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  email: PropTypes.string,
});

export const UserFactory = () => {
  return {
    _id: 'userID',
    username: 'billy',
    email: 'billy@bob.com',
  };
};
