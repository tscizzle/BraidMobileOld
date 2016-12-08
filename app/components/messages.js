import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, ListView, TouchableOpacity } from 'react-native';
import Hr from 'react-native-hr';
import Config from 'react-native-config';
import Icon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';

import UserSchema from '../models/user.js';
import ConvoSchema from '../models/convo.js';
import StrandSchema from '../models/strand.js';
import MessageSchema from '../models/message.js';
import { partnerFromConvo, filterMessagesByStrand } from '../helpers.js';
import braidStyles from '../styles.js';


const DEFAULT_NUM_MESSAGES = 30;
const STRAND_COLOR_ORDER = ['#EFBFFF', '#9EEFD0', '#FFFAAD', '#FFC99E', '#F2969F'];
STRAND_COLOR_ORDER[-1] = '#DDD';


const MessagesScenePropTypes = {
  navigateTo: PropTypes.func.isRequired,
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
    fetch(Config.BRAID_SERVER_URL + '/api/username/' + partnerID)
      .then(usernameRes => {
        return usernameRes.json();
      })
      .then(usernameJSON => {
        const partnerUsername = usernameJSON.username;
        this.setState({partnerUsername});
      })
      .catch(err => console.log('get partner username err', err));
  }

  render() {
    return (
      <View>
        <MessagesNavbar chatNavigateTo={this.props.chatNavigateTo}
                        loggedInUser={this.props.loggedInUser}
                        convo={this.props.convo}
                        partnerUsername={this.state.partnerUsername} />
        <MessagesContainer navigateTo={this.props.navigateTo}
                           chatNavigateTo={this.props.chatNavigateTo}
                           loggedInUser={this.props.loggedInUser}
                           convo={this.props.convo} />
      </View>
    );
  }
}

MessagesScene.propTypes = MessagesScenePropTypes;


MessagesNavbarPropTypes = {
  chatNavigateTo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  convo: ConvoSchema.isRequired,
  partnerUsername: PropTypes.string,
};

export class MessagesNavbar extends Component {
  _pressBackToFriendships = () => this.props.chatNavigateTo('friendships');

  render() {
    return (
      <View style={messagesStyles.messagesNavbar}>
        <TouchableOpacity onPress={this._pressBackToFriendships}>
          <Icon style={[braidStyles.icon, messagesStyles.messagesNavbarIcon]} name='angle-left' />
        </TouchableOpacity>
        <Text style={[braidStyles.text, messagesStyles.partnerUsername]}>
          {this.props.partnerUsername}
        </Text>
        <TouchableOpacity>
          <Icon style={[braidStyles.icon, messagesStyles.messagesNavbarIcon]} name='eye' />
        </TouchableOpacity>
      </View>
    );
  }
}

MessagesNavbar.propTypes = MessagesNavbarPropTypes;


const MessagesContainerPropTypes = {
  loggedInUser: UserSchema.isRequired,
  convo: ConvoSchema.isRequired,
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
    const convoID = this.props.convo._id;

    fetch(Config.BRAID_SERVER_URL + '/api/messages/' + convoID + '/' + DEFAULT_NUM_MESSAGES)
      .then(messagesRes => {
        return messagesRes.json();
      })
      .then(messagesJSON => {
        this.setState({messages: messagesJSON});
      })
      .catch(err => console.log('get messages err', err));

    fetch(Config.BRAID_SERVER_URL + '/api/strands/' + convoID)
      .then(strandsRes => {
        return strandsRes.json();
      })
      .then(strandsJSON => {
        this.setState({strands: strandsJSON});
        const strandMap = _.reduce(strandsJSON, (strandMapSoFar, strand) => {
          return _.extend(strandMapSoFar, {[strand._id]: strand});
        }, {});
        this.setState({strandMap});
      })
      .catch(err => console.log('get strands err', err));
  }

  _setCurrentStrandID = strandID => {
    this.setState({currentStrandID: strandID});
  };

  render() {
    return (
      <Messages setCurrentStrandID={this._setCurrentStrandID}
                strandMap={this.state.strandMap}
                loggedInUser={this.props.loggedInUser}
                messages={this.state.messages}
                currentStrandID={this.state.currentStrandID} />
    );
  }
}

MessagesContainer.propTypes = MessagesContainerPropTypes;


const MessagesPropTypes = {
  setCurrentStrandID: PropTypes.func.isRequired,
  strandMap: PropTypes.object.isRequired,
  loggedInUser: UserSchema.isRequired,
  messages: PropTypes.arrayOf(MessageSchema).isRequired,
  currentStrandID: PropTypes.string,
};

export class Messages extends Component {
  constructor(props) {
    super(props);
    const messagesDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {messagesDataSource};
  }

  _renderMessage = message => {
    return <Message setCurrentStrandID={this.props.setCurrentStrandID}
                    strandMap={this.props.strandMap}
                    loggedInUser={this.props.loggedInUser}
                    currentStrandID={this.props.currentStrandID}
                    message={message}
                    key={message._id} />;
  }

  _pressMessageList = () => {
    this.props.setCurrentStrandID(null);
  }

  render() {
    const visibleMessages = filterMessagesByStrand(this.props.messages, this.props.currentStrandID);
    const messagesDataSource = this.state.messagesDataSource.cloneWithRows(visibleMessages);
    return (
      <TouchableOpacity style={messagesStyles.messagesList}
                        onPress={this._pressMessageList}>
        <ListView dataSource={messagesDataSource}
                  renderRow={this._renderMessage}
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
        <View style={[messagesStyles.messageBubble, messagesStyles[messageBubbleClass], {backgroundColor: messageColor}]}>
          <Text style={braidStyles.text}>
            {this.props.message.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

Message.propTypes = MessagePropTypes;


const messagesStyles = StyleSheet.create({
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
    marginRight: 20,
    marginLeft: 20,
    height: 30,
    width: 30,
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
});
