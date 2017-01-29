import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, TextInput, ListView, TouchableOpacity, RefreshControl } from 'react-native';
import Button from 'react-native-button';
import Hr from 'react-native-hr';
import Icon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';

import UserSchema from '../models/user.js';
import ConvoSchema from '../models/convo.js';
import MessageSchema from '../models/message.js';
import { jsonHeaders,
         partnerFromConvo,
         filterMessagesByStrand,
         thisColorNumber,
         STRAND_COLOR_ORDER      } from '../helpers.js';
import { braidFetch, braidFetchJSON } from '../api.js';
import braidStyles from '../styles.js';


const DEFAULT_NUM_MESSAGES = 30;


const MessagesScenePropTypes = {
  chatNavigateTo: PropTypes.func.isRequired,
  setPartnerUsername: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  convo: ConvoSchema.isRequired,
};

export default class MessagesScene extends Component {
  componentDidMount() {
    const partnerID = partnerFromConvo(this.props.loggedInUser, this.props.convo);
    braidFetchJSON('/api/username/' + partnerID)
      .then(usernameJSON => {
        const partnerUsername = usernameJSON.username;
        this.props.setPartnerUsername(partnerUsername);
      })
      .catch(err => console.log('get partner username err', err));
  }

  componentWillUnmount() {
    this.props.setPartnerUsername(null);
  }

  render() {
    return (
      <MessagesContainer chatNavigateTo={this.props.chatNavigateTo}
                         loggedInUser={this.props.loggedInUser}
                         convo={this.props.convo} />
    );
  }
}

MessagesScene.propTypes = MessagesScenePropTypes;


const MessagesContainerPropTypes = {
  chatNavigateTo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  convo: ConvoSchema.isRequired,
};

export class MessagesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      numMessages: DEFAULT_NUM_MESSAGES,
      currentStrandID: null,
      strandMap: {},
    };
  }

  componentDidMount() {
    this._refreshMessages();
  }

  componentDidUpdate(prevProps, prevState) {
    // only refresh if convo or numMessages has changed
    if (prevProps.convo._id !== this.props.convo._id || prevState.numMessages !== this.state.numMessages) {
      this._refreshMessages();
    }
  }

  _setNumMessages = (numMessages, callback = () => {}) => this.setState({numMessages}, callback);

  _setCurrentStrandID = strandID => this.setState({currentStrandID: strandID});

  _refreshMessages = () => {
    const convoID = this.props.convo._id;
    const numMessages = this.state.numMessages;
    braidFetchJSON('/api/messages/' + convoID + '/' + numMessages)
      .then(messagesJSON => {
        this.setState({messages: messagesJSON});
      })
      .catch(err => {
        console.log('get messages err', err);
      });
    braidFetchJSON('/api/strands/' + convoID)
      .then(strandsJSON => {
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
                        refreshMessages={this._refreshMessages}
                        loggedInUser={this.props.loggedInUser}
                        convo={this.props.convo}
                        visibleMessages={visibleMessages}
                        numMessages={this.state.numMessages} />
        <Messages setCurrentStrandID={this._setCurrentStrandID}
                  setNumMessages={this._setNumMessages}
                  strandMap={this.state.strandMap}
                  loggedInUser={this.props.loggedInUser}
                  visibleMessages={visibleMessages}
                  currentStrandID={this.state.currentStrandID}
                  numMessages={this.state.numMessages} />
        <SendMessageContainer setCurrentStrandID={this._setCurrentStrandID}
                              refreshMessages={this._refreshMessages}
                              strandMap={this.state.strandMap}
                              loggedInUser={this.props.loggedInUser}
                              convo={this.props.convo}
                              messages={this.state.messages}
                              currentStrandID={this.state.currentStrandID}
                              numMessages={this.state.numMessages} />
      </View>
    );
  }
}

MessagesContainer.propTypes = MessagesContainerPropTypes;


MessagesNavbarPropTypes = {
  chatNavigateTo: PropTypes.func.isRequired,
  refreshMessages: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  convo: ConvoSchema.isRequired,
  visibleMessages: PropTypes.arrayOf(MessageSchema).isRequired,
  numMessages: PropTypes.number.isRequired,
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
    const numMessagesToGet = this.props.numMessages;
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
        <TouchableOpacity onPress={this.props.refreshMessages}>
          <Icon style={[braidStyles.icon, messagesStyles.messagesNavbarIcon]} name='refresh' />
        </TouchableOpacity>
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
  setNumMessages: PropTypes.func.isRequired,
  strandMap: PropTypes.object.isRequired,
  loggedInUser: UserSchema.isRequired,
  visibleMessages: PropTypes.arrayOf(MessageSchema).isRequired,
  currentStrandID: PropTypes.string,
  numMessages: PropTypes.number.isRequired,
};

export class Messages extends Component {
  constructor(props) {
    super(props);
    const messagesDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      messagesDataSource,
      refreshingMessages: false,
      // for being able to scroll to the bottom
      messagesListHeight: 0,
      messagesFooterY: 0,
    };
  }

  componentDidUpdate() {
    const scrollDistance = this.state.messagesFooterY - this.state.messagesListHeight;
    if (scrollDistance > 0) {
      this.refs.messagesListView.scrollTo({y: scrollDistance, animated: false});
    }
  }

  _pressMessageList = () => this.props.setCurrentStrandID(null);

  _renderMessage = message => <Message setCurrentStrandID={this.props.setCurrentStrandID}
                                       strandMap={this.props.strandMap}
                                       loggedInUser={this.props.loggedInUser}
                                       currentStrandID={this.props.currentStrandID}
                                       message={message}
                                       key={message._id} />

  _renderFooter = () => <View onLayout={this._saveFooterY}></View>

  _saveHeight = event => this.setState({messagesListHeight: event.nativeEvent.layout.height});

  _saveFooterY = event => this.setState({messagesFooterY: event.nativeEvent.layout.y});

  _increaseNumMessages = () => {
    this.setState({refreshingMessages: true});
    const newNumMessages = this.props.numMessages + DEFAULT_NUM_MESSAGES;
    this.props.setNumMessages(newNumMessages, () => {
      this.setState({refreshingMessages: false});
    });
  };

  render() {
    const messagesDataSource = this.state.messagesDataSource.cloneWithRows(this.props.visibleMessages);
    messagesRefreshControl = <RefreshControl refreshing={this.state.refreshingMessages}
                                             onRefresh={this._increaseNumMessages}
                                             title='Camaahhn...'
                                             titleColor='#777' />
    return (
      <TouchableOpacity style={messagesStyles.messagesList}
                        onPress={this._pressMessageList}>
        <ListView ref="messagesListView"
                  dataSource={messagesDataSource}
                  renderRow={this._renderMessage}
                  renderFooter={this._renderFooter}
                  onLayout={this._saveHeight}
                  refreshControl={messagesRefreshControl}
                  pageSize={this.props.numMessages}
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


const SendMessageContainerPropTypes = {
  setCurrentStrandID: PropTypes.func.isRequired,
  refreshMessages: PropTypes.func.isRequired,
  strandMap: PropTypes.object.isRequired,
  loggedInUser: UserSchema.isRequired,
  convo: ConvoSchema.isRequired,
  messages: PropTypes.arrayOf(MessageSchema).isRequired,
  currentStrandID: PropTypes.string,
  numMessages: PropTypes.number.isRequired,
};

export class SendMessageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageForm: {
        text: '',
      },
      sendDisabled: false,
    };
  }

  _typeIntoText = textInput => {
    this.setState({messageForm: {...this.state.messageForm, text: textInput}});
  }

  _pressSend = () => {
    const afterSend = () => {
      this.props.refreshMessages();
      this.setState({messageForm: {text: ''}});
      this.setState({sendDisabled: false});
    };

    this.setState({sendDisabled: true});
    const partnerID = partnerFromConvo(this.props.loggedInUser, this.props.convo);
    const messageData = {
      text: this.state.messageForm.text,
      convo_id: this.props.convo._id,
      sender_id: this.props.loggedInUser._id,
      receiver_id: partnerID,
      time_sent: new Date(),
    };
    if (this.props.currentStrandID) {
      messageData.strand_id = this.props.currentStrandID;
      const numMessages = this.props.numMessages;
      braidFetchJSON('/api/messages/' + numMessages, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(messageData),
      })
        .then(afterSend)
        .catch(err => {
          console.log('send message on existing strand err', err);
          afterSend();
        });
    } else {
      const colorNumber = thisColorNumber(this.props.messages, this.props.strandMap);
      const strandData = {
        convo_id: this.props.convo._id,
        color_number: colorNumber,
        time_created: new Date(),
        user_id_0: this.props.convo.user_id_0,
        user_id_1: this.props.convo.user_id_1,
      };
      const messageCreationBody = {
        message: messageData,
        strand: strandData,
        strand_message_ids: [],
        num_messages: this.props.numMessages,
      };
      braidFetchJSON('/api/messagesNewStrand', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(messageCreationBody),
      })
        .then(dataJSON => {
          const new_strand_id = dataJSON.new_strand._id;
          this.props.setCurrentStrandID(new_strand_id);
        })
        .then(afterSend)
        .catch(err => {
          console.log('send message on new strand err', err);
          afterSend();
        });
    }
  }

  render() {
    return (
      <View style={messagesStyles.sendMessageContainer}>
        <TextInput style={[messagesStyles.sendInput]}
                   onChangeText={this._typeIntoText}
                   value={this.state.messageForm.text}
                   placeholder='Type a message...'
                   multiline={true} />
        <Button style={[braidStyles.button, braidStyles.primaryButton, messagesStyles.sendButton]}
                styleDisabled={braidStyles.disabledButton}
                onPress={this._pressSend}
                disabled={this.state.sendDisabled}>
          Send
        </Button>
      </View>
    );
  }
}

SendMessageContainer.propTypes = SendMessageContainerPropTypes;


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
  messagesList: {
    flex: 7,
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
  sendMessageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    margin: 5,
  },
  sendInput: {
    flex: 5,
    marginRight: 2.5,
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
    paddingLeft: 10,
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 15,
  },
  sendButton: {
    flex: 1,
    marginLeft: 2.5,
  },
});
