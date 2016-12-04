import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, Linking, ListView, TouchableOpacity } from 'react-native';
import Button from 'react-native-button';
import Hr from 'react-native-hr';
import Config from 'react-native-config';
import _ from 'lodash';

import UserSchema from '../models/user.js';
import ConvoSchema from '../models/convo.js';
import StrandSchema from '../models/strand.js';
import MessageSchema from '../models/message.js';
import braidStyles from '../styles.js';


const DEFAULT_NUM_MESSAGES = 30;


const MessagesPropTypes = {
  navigateTo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  currentConvo: ConvoSchema.isRequired,
};

export default class Messages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      currentStrandID: null,
    };
  }

  componentWillMount() {
    this._refreshMessages();
  }

  _refreshMessages = () => {
    const convoID = this.props.currentConvo._id;
    fetch(Config.BRAID_SERVER_URL + '/api/messages/' + convoID + '/' + DEFAULT_NUM_MESSAGES)
      .then(messagesRes => {
        return messagesRes.json();
      })
      .then(messagesJSON => {
        const visibleMessages = _.filter(messagesJSON, message => {
          return !this.state.currentStrandID || message.strand_id === this.state.currentStrandID
        });
        this.setState({messages: visibleMessages});
      })
      .catch(err => console.log('get messages err', err));
  }

  _setcurrentStrandID = strand => {
    this.setState({currentStrandID: strand});
    this._refreshMessages();
  };

  render() {
    return (
      <View style={messagesStyles.messagesContainer}>
        <MessagesList setcurrentStrandID={this._setcurrentStrandID}
                      loggedInUser={this.props.loggedInUser}
                      messages={this.state.messages} />
      </View>
    );
  }
}

Messages.propTypes = MessagesPropTypes;


const MessagesListPropTypes = {
  setcurrentStrandID: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  messages: PropTypes.arrayOf(MessageSchema).isRequired,
};

export class MessagesList extends Component {
  constructor(props) {
    super(props);
    const messagesDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {messagesDataSource: messagesDataSource.cloneWithRows(this.props.messages)};
  }

  componentWillReceiveProps(nextProps) {
    const newMessages = nextProps.messages;
    this.setState({messagesDataSource: this.state.messagesDataSource.cloneWithRows(newMessages)});
  }

  _renderMessageInList = message => {
    return <MessageInList setcurrentStrandID={this.props.setcurrentStrandID}
                          loggedInUser={this.props.loggedInUser}
                          message={message}
                          key={message._id} />;
  }

  render() {
    return (
      <ListView dataSource={this.state.messagesDataSource}
                renderRow={this._renderMessageInList}
                enableEmptySections={true} />
    );
  }
}

MessagesList.propTypes = MessagesListPropTypes;


const MessageInListPropTypes = {
  setcurrentStrandID: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  message: MessageSchema.isRequired,
};

export class MessageInList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _pressMessage = () => this.props.setcurrentStrandID(this.props.message.strand_id)

  render() {
    const senderID = this.props.message.sender_id;
    const userID = this.props.loggedInUser._id;
    const messageClass = senderID === userID ? 'userMessage' : 'partnerMessage';
    const messageTextClass = senderID === userID ? 'userMessageText' : 'partnerMessageText';
    return (
      <TouchableOpacity style={[messagesStyles.messageInListContainer, messagesStyles[messageClass]]}
                        onPress={this._pressMessage}>
        <Text style={[braidStyles.text, messagesStyles.messageBubble, messagesStyles[messageTextClass]]}>
          {this.props.message.text}
        </Text>
      </TouchableOpacity>
    );
  }
}

MessageInList.propTypes = MessageInListPropTypes;


const messagesStyles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
  },
  messageInListContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    borderRadius: 20,
  },
  userMessage: {
    flexDirection: 'row',
  },
  partnerMessage: {
    flexDirection: 'row-reverse',
  },
  messageBubble: {
    padding: 10,
  },
  userMessageText: {
    backgroundColor: '#69C',
  },
  partnerMessageText: {
    backgroundColor: '#EEE',
  },
});
