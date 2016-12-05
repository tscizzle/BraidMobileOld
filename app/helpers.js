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

export const filterMessagesByStrand = (messages, strandID) => {
  const filteredMessages = _.filter(messages, message => {
    return !strandID || message.strand_id === strandID;
  });
  return filteredMessages;
};
