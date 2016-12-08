import _ from 'lodash';


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

export const partnerFromConvo = (user, convo) => {
  const userID = user._id;
  const userID0 = convo.user_id_0;
  const userID1 = convo.user_id_1;
  return userID === userID0 ? userID1 : userID0;
};

export const filterMessagesByStrand = (messages, strandID) => {
  const filteredMessages = _.filter(messages, message => {
    return !strandID || message.strand_id === strandID;
  });
  return filteredMessages;
};
