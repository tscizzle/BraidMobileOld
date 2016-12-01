import React from 'react';


export const partnerFromFriendship = (user, friendship) => {
  const userID = user._id;
  const requesterID = friendship.requester_id;
  const targetID = friendship.target_id;
  return userID === requesterID ? targetID : requesterID;
};
