import React, { PropTypes } from 'react';


export default StrandSchema = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  convo_id: PropTypes.string.isRequired,
  color_number: PropTypes.number.isRequired,
  time_created: PropTypes.string.isRequired,
  user_id_0: PropTypes.string.isRequired,
  user_id_1: PropTypes.string.isRequired,
});

export const StrandFactory = () => {
  return {
    _id: 'strandID',
    convo_id: 'convoID',
    color_number: 2,
    time_created: '2016-05-18 20:30:07+00:00',
    user_id_0: 'userID_0',
    user_id_1: 'userID_1',
  };
};
