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
  time_read: PropTypes.string,
  addressed: PropTypes.bool,
});

export const MessageFactory = () => {
  return {
    _id: 'messageID',
    text: 'hey dude!',
    convo_id: 'convoID',
    receiver_id: 'receiverID',
    strand_id: 'strandID',
    time_sent: '2016-05-18 20:30:05+00:00',
    time_saved: '2016-05-18 20:30:06+00:00',
  };
};
