import React, { PropTypes } from 'react';


export default ConvoSchema = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  user_id_0: PropTypes.string.isRequired,
  user_id_1: PropTypes.string.isRequired,
  last_message_time: PropTypes.string,
});
