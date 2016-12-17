import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, ListView, TouchableOpacity } from 'react-native';
import Hr from 'react-native-hr';
import Icon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';

import UserSchema from '../models/user.js';
import ConvoSchema from '../models/convo.js';
import StrandSchema from '../models/strand.js';
import MessageSchema from '../models/message.js';
import { jsonHeaders,
         partnerFromConvo,
         filterMessagesByStrand } from '../helpers.js';
import { braidFetch, braidFetchJSON } from '../api.js';
import braidStyles from '../styles.js';


const DEFAULT_NUM_MESSAGES = 30;
const STRAND_COLOR_ORDER = ['#EFBFFF', '#9EEFD0', '#FFFAAD', '#FFC99E', '#F2969F'];
STRAND_COLOR_ORDER[-1] = '#DDD';


const MessagesScenePropTypes = {
  chatNavigateTo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  convo: ConvoSchema.isRequired,
};

export default class MessagesScene extends Component {
  constructor(props) {
    super(props);
    this.state = {partnerUsername: null};
  }

  componentWillMount() {
    const partnerID = partnerFromConvo(this.props.loggedInUser, this.props.convo);
    braidFetchJSON('/api/username/' + partnerID)
      .then(usernameJSON => {
        const partnerUsername = usernameJSON.username;
        this.setState({partnerUsername});
      })
      .catch(err => console.log('get partner username err', err));
  }

  render() {
    return (
      <MessagesContainer chatNavigateTo={this.props.chatNavigateTo}
                         loggedInUser={this.props.loggedInUser}
                         convo={this.props.convo}
                         partnerUsername={this.state.partnerUsername} />
    );
  }
}

MessagesScene.propTypes = MessagesScenePropTypes;


const MessagesContainerPropTypes = {
  chatNavigateTo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  convo: ConvoSchema.isRequired,
  partnerUsername: PropTypes.string,
};

export class MessagesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      currentStrandID: null,
      strands: [],
      strandMap: {},
    };
  }

  componentWillMount() {
    this._refreshMessages();
  }

  _setCurrentStrandID = strandID => this.setState({currentStrandID: strandID});

  _refreshMessages = (callback = () => {}) => {
    const convoID = this.props.convo._id;

    braidFetchJSON('/api/messages/' + convoID + '/' + DEFAULT_NUM_MESSAGES)
      .then(messagesJSON => {
        this.setState({messages: messagesJSON});
      })
      .then(callback)
      .catch(err => {
        console.log('get messages err', err);
        callback();
      });

    braidFetchJSON('/api/strands/' + convoID)
      .then(strandsJSON => {
        this.setState({strands: strandsJSON});
        const strandMap = _.reduce(strandsJSON, (strandMapSoFar, strand) => {
          return _.extend(strandMapSoFar, {[strand._id]: strand});
        }, {});
        this.setState({strandMap});
      })
      .catch(err => console.log('get strands err', err));
  }

  render() {
    const visibleMessages = filterMessagesByStrand(this.state.messages, this.state.currentStrandID);
    return (
      <View style={messagesStyles.messagesScene}>
        <MessagesNavbar chatNavigateTo={this.props.chatNavigateTo}
                        loggedInUser={this.props.loggedInUser}
                        convo={this.props.convo}
                        partnerUsername={this.props.partnerUsername}
                        visibleMessages={visibleMessages} />
        <Messages setCurrentStrandID={this._setCurrentStrandID}
                  refreshMessages={this._refreshMessages}
                  strandMap={this.state.strandMap}
                  loggedInUser={this.props.loggedInUser}
                  visibleMessages={visibleMessages}
                  currentStrandID={this.state.currentStrandID} />
      </View>

    );
  }
}

MessagesContainer.propTypes = MessagesContainerPropTypes;


MessagesNavbarPropTypes = {
  chatNavigateTo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  convo: ConvoSchema.isRequired,
  partnerUsername: PropTypes.string,
  visibleMessages: PropTypes.arrayOf(MessageSchema).isRequired,
};

export class MessagesNavbar extends Component {
  _pressBackToFriendships = () => this.props.chatNavigateTo('friendships');

  _pressMarkMessagesAsRead = () => {
    const convoID = this.props.convo._id;
    const messagesToMark = _.filter(this.props.visibleMessages, message => {
      // message is from the partner and is not yet marked read
      return message.receiver_id === this.props.loggedInUser._id && !message.time_read;
    });
    const messageIDs = _.map(messagesToMark, '_id');
    const userID = this.props.loggedInUser._id;
    const timeRead = new Date();
    const numMessagesToGet = DEFAULT_NUM_MESSAGES;
    const markMessagesAsReadRoute = '/api/markMessagesAsRead/' + convoID;
    const markMessagesAsReadBody = {
      message_ids: messageIDs,
      user_id: userID,
      time_read: timeRead,
      num_messages: numMessagesToGet,
    };
    braidFetch(markMessagesAsReadRoute, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(markMessagesAsReadBody),
    })
      .catch(err => console.log('mark messages as read err', err));
  }

  render() {
    return (
      <View style={messagesStyles.messagesNavbar}>
        <TouchableOpacity onPress={this._pressBackToFriendships}>
          <Icon style={[braidStyles.icon, messagesStyles.messagesNavbarIcon]} name='angle-left' />
        </TouchableOpacity>
        <Text style={[braidStyles.text, messagesStyles.partnerUsername]}>
          {this.props.partnerUsername}
        </Text>
        <TouchableOpacity onPress={this._pressMarkMessagesAsRead}>
          <Icon style={[braidStyles.icon, messagesStyles.messagesNavbarIcon]} name='check' />
        </TouchableOpacity>
      </View>
    );
  }
}

MessagesNavbar.propTypes = MessagesNavbarPropTypes;


const MessagesPropTypes = {
  setCurrentStrandID: PropTypes.func.isRequired,
  refreshMessages: PropTypes.func.isRequired,
  strandMap: PropTypes.object.isRequired,
  loggedInUser: UserSchema.isRequired,
  visibleMessages: PropTypes.arrayOf(MessageSchema).isRequired,
  currentStrandID: PropTypes.string,
};

export class Messages extends Component {
  constructor(props) {
    super(props);
    const messagesDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      messagesDataSource,
      refreshingMessages: false,
      messagesListHeight: 0,
      messagesFooterY: 0,
    };
  }

  componentDidUpdate() {
    const scrollDistance = this.state.messagesFooterY - this.state.messagesListHeight;
    this.refs.messagesListView.scrollTo({y: scrollDistance, animated: false});
  }

  _pressMessageList = () => this.props.setCurrentStrandID(null);

  _renderMessage = message => <Message setCurrentStrandID={this.props.setCurrentStrandID}
                                       strandMap={this.props.strandMap}
                                       loggedInUser={this.props.loggedInUser}
                                       currentStrandID={this.props.currentStrandID}
                                       message={message}
                                       key={message._id} />

  _renderFooter = () => <View onLayout={this._saveFooterY}></View>

  _saveFooterY = event => this.setState({messagesFooterY: event.nativeEvent.layout.y});

  _saveHeight = event => this.setState({messagesListHeight : event.nativeEvent.layout.height});

  render() {
    const messagesDataSource = this.state.messagesDataSource.cloneWithRows(this.props.visibleMessages);
    return (
      <TouchableOpacity style={messagesStyles.messagesList}
                        onPress={this._pressMessageList}>
        <ListView ref="messagesListView"
                  dataSource={messagesDataSource}
                  renderRow={this._renderMessage}
                  renderFooter={this._renderFooter}
                  onLayout={this._saveHeight}
                  enableEmptySections={true} />
      </TouchableOpacity>
    );
  }
}

Messages.propTypes = MessagesPropTypes;


const MessagePropTypes = {
  setCurrentStrandID: PropTypes.func.isRequired,
  strandMap: PropTypes.object.isRequired,
  loggedInUser: UserSchema.isRequired,
  currentStrandID: PropTypes.string,
  message: MessageSchema.isRequired,
};

export class Message extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _pressMessage = () => {
    const nextStrandID = !this.props.currentStrandID ? this.props.message.strand_id : null;
    this.props.setCurrentStrandID(nextStrandID);
  };

  render() {
    const senderID = this.props.message.sender_id;
    const userID = this.props.loggedInUser._id;
    const messageClass = senderID === userID ? 'userMessage' : 'partnerMessage';
    const messageBubbleClass = senderID === userID ? 'userMessageBubble' : 'partnerMessageBubble';
    const messageStrand = this.props.strandMap[this.props.message.strand_id];
    const messageColorNumber = messageStrand ? messageStrand.color_number : -1;
    const messageColor = STRAND_COLOR_ORDER[messageColorNumber];
    return (
      <TouchableOpacity style={[messagesStyles.messageRow, messagesStyles[messageClass]]}
                        onPress={this._pressMessage}>
        <View style={[messagesStyles.messageBubble,
                      messagesStyles[messageBubbleClass],
                      {backgroundColor: messageColor}]}>
          <Text style={[braidStyles.text, messagesStyles.messageText]}>
            {this.props.message.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

Message.propTypes = MessagePropTypes;


const messagesStyles = StyleSheet.create({
  messagesScene: {
    flex: 1,
  },
  messagesNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingRight: 10,
    paddingLeft: 10,
    backgroundColor: '#CCC',
  },
  messagesNavbarIcon: {
    marginRight: 10,
    marginLeft: 10,
    height: 35,
    width: 55,
    fontSize: 30,
    textAlign: 'center',
  },
  partnerUsername: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  messageRow: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  userMessage: {
    flexDirection: 'row',
  },
  partnerMessage: {
    flexDirection: 'row-reverse',
  },
  messageBubble: {
    maxWidth: 250,
    padding: 10,
  },
  userMessageBubble: {
    borderRadius: 20,
  },
  partnerMessageBubble: {
    borderRadius: 0,
  },
  messageText: {
    fontSize: 15,
  },
});
