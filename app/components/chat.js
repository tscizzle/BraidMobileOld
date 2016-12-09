import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import UserSchema from '../models/user.js';

import FriendshipsContainer from './friendships.js';
import MessagesScene from './messages.js';


const ChatPropTypes = {
  navigateTo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
};

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatCurrentScene: 'friendships',
      convo: null,
    };
  }

  _chatNavigateTo = chatScene => this.setState({chatCurrentScene: chatScene});

  _setConvo = convo => this.setState({convo});

  render() {
    return (
      <View style={chatStyles.chatContainer}>
        {this.state.chatCurrentScene === 'friendships' &&
          <FriendshipsContainer navigateTo={this.props.navigateTo}
                                chatNavigateTo={this._chatNavigateTo}
                                setConvo={this._setConvo}
                                loggedInUser={this.props.loggedInUser} />
        }
        {this.state.convo && this.state.chatCurrentScene === 'messages' &&
          <MessagesScene chatNavigateTo={this._chatNavigateTo}
                         loggedInUser={this.props.loggedInUser}
                         convo={this.state.convo} />
        }
      </View>
    );
  }
}

Chat.PropTypes = ChatPropTypes;


const chatStyles = StyleSheet.create({
  chatContainer: {
    flex: 1,
  },
});
