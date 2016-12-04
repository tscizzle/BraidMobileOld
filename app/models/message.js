import React, { PropTypes } from 'react';


export default MessageSchema = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  convo_id: PropTypes.string.isRequired,
  sender_id: PropTypes.string.isRequired,
  receiver_id: PropTypes.string.isRequired,
  strand_id: PropTypes.string,
  time_sent: PropTypes.string.isRequired,
  time_saved: PropTypes.string.isRequired,
  time_received: PropTypes.string,
  time_read: PropTypes.string,
  addressed: PropTypes.bool,
});
