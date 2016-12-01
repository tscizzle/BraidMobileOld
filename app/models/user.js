import React from 'react';


export default UserSchema = React.PropTypes.shape({
  _id: React.PropTypes.string.isRequired,
  username: React.PropTypes.string.isRequired,
  email: React.PropTypes.string,
});
