import React, { PropTypes } from 'react';


export default ConvoSchema = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  user_id_0: PropTypes.string.isRequired,
  user_id_1: PropTypes.string.isRequired,
  last_message_time: PropTypes.string,
});

export const ConvoFactory = () => {
  return {
    _id: 'convoID',
    user_id_0: 'userID_0',
    user_id_1: 'userID_1',
  };
};
