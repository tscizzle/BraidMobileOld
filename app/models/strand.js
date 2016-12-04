import React, { PropTypes } from 'react';


export default StrandSchema = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  convo_id: PropTypes.string.isRequired,
  color_number: PropTypes.number.isRequired,
  time_created: PropTypes.string.isRequired,
  user_id_0: PropTypes.string.isRequired,
  user_id_1: PropTypes.string.isRequired,
});
