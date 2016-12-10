import React, { PropTypes } from 'react';


export default FriendshipSchema = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  requester_id: PropTypes.string.isRequired,
  target_id: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['pending', 'accepted']).isRequired,
});

export const FriendshipFactory = () => {
  return {
    _id: 'friendshipID',
    requester_id: 'requesterID',
    target_id: 'targetID',
    status: 'accepted',
  };
};
