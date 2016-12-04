import React from 'react';


export const jsonHeaders = () => {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
};

export const partnerFromFriendship = (user, friendship) => {
  const userID = user._id;
  const requesterID = friendship.requester_id;
  const targetID = friendship.target_id;
  return userID === requesterID ? targetID : requesterID;
};
