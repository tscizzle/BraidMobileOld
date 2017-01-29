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

export const convoFromFriendship = (friendship, convos) => {
  const matchingConvo = _.find(convos, convo => {
    var convoPair = [convo.user_id_0, convo.user_id_1].sort();
    var friendshipPair = [friendship.requester_id, friendship.target_id].sort();
    return _.isEqual(convoPair, friendshipPair);
  });
  return matchingConvo;
};

export const filterMessagesByStrand = (messages, strandID) => {
  const filteredMessages = _.filter(messages, message => {
    return !strandID || message.strand_id === strandID;
  });
  return filteredMessages;
};

export const thisColorNumber = (messages, strandMap) => {
  /* returns the least recently used color_number */
  var messageColorNumbers = _.map(messages, message => {
    if (message.strand_id && strandMap[message.strand_id]) {
      return strandMap[message.strand_id].color_number;
    }
  });
  var thisColorIndex = _.minBy(_.range(STRAND_COLOR_ORDER.length), color_number => {
    return _.lastIndexOf(messageColorNumbers, color_number);
  });
  return thisColorIndex;
};

export const STRAND_COLOR_ORDER = [
  '#EFBFFF',
  '#9EEFD0',
  '#FFFAAD',
  '#FFC99E',
  '#F2969F',
];
STRAND_COLOR_ORDER[-1] = '#DDD';

export const COLOR_TO_FADED_MAP = {
  '#EFBFFF': '#F2DBFF',
  '#9EEFD0': '#CEF2ED',
  '#FFFAAD': '#EDFFD9',
  '#FFC99E': '#FFE6C2',
  '#F2969F': '#F2C2AE',
};
