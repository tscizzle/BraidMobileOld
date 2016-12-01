import React from 'react';


export default FriendshipSchema = React.PropTypes.shape({
  _id: React.PropTypes.string.isRequired,
  requester_id: React.PropTypes.string.isRequired,
  target_id: React.PropTypes.string.isRequired,
  status: React.PropTypes.oneOf(['pending', 'accepted']).isRequired,
});
