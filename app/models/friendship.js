import React, { PropTypes } from 'react';


export default FriendshipSchema = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  requester_id: PropTypes.string.isRequired,
  target_id: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['pending', 'accepted']).isRequired,
});
