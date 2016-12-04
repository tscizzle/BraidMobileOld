import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import UserSchema from '../models/user.js';

import Friendships from './friendships.js';
import Messages from './messages.js';


const ChatPropTypes = {
  navigateTo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
};

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatCurrentScene: 'friendships',
      currentConvo: null,
    };
  }

  _chatNavigateTo = chatScene => this.setState({chatCurrentScene: chatScene});

  _setCurrentConvo = convo => this.setState({currentConvo: convo});

  render() {
    return (
      <View style={chatStyles.chatContainer}>
        {this.state.chatCurrentScene === 'friendships' &&
          <Friendships navigateTo={this.props.navigateTo}
                       chatNavigateTo={this._chatNavigateTo}
                       setCurrentConvo={this._setCurrentConvo}
                       loggedInUser={this.props.loggedInUser} />
        }
        {this.state.chatCurrentScene === 'messages' &&
          <Messages navigateTo={this.props.navigateTo}
                    chatNavigateTo={this._chatNavigateTo}
                    loggedInUser={this.props.loggedInUser}
                    currentConvo={this.state.currentConvo} />
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
