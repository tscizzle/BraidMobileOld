import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, PushNotificationIOS } from 'react-native';
import Button from 'react-native-button';
import Icon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';

import UserSchema from '../models/user.js';
import { braidFetchJSON } from '../api.js';
import braidStyles from '../styles.js';
import Login from './login.js';
import SettingsContainer from './settings.js';
import Chat from './chat.js';


export default class BraidMobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentScene: 'login',
      loggedInUser: null,
      partnerUsername: null,
    };

    PushNotificationIOS.getInitialNotification().then(this._onNotification);
    PushNotificationIOS.addEventListener('notification', this._onNotification);
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('notification', this._onNotification);
  }

  _onNotification = notification => {
    if (notification) {
      const convoID = notification.getData().convo_id;
      if (convoID) {
        braidFetchJSON('/api/convo/' + convoID)
          .then(convoJSON => {
            this._navigateTo('chat');
            // TODO: open the convo for convoID, need to somehow pass convoID down through the components
            // const chatComponent = null;
            // chatComponent._setConvo(convoJSON);
            // chatComponent._chatNavigateTo('messages');
          })
          .catch(err => console.log('get convo err', err));
      }
    }
  }

  _navigateTo = scene => this.setState({currentScene: scene});

  _setLoggedInUser = user => this.setState({loggedInUser: user});

  _setPartnerUsername = username => this.setState({partnerUsername: username});

  render() {
    return (
      <View style={mainStyles.mainContainer}>
        <Navbar navigateTo={this._navigateTo}
                partnerUsername={this.state.partnerUsername}
                loggedInUser={this.state.loggedInUser} />
        <Content navigateTo={this._navigateTo}
                 setLoggedInUser={this._setLoggedInUser}
                 setPartnerUsername={this._setPartnerUsername}
                 currentScene={this.state.currentScene}
                 loggedInUser={this.state.loggedInUser} />
      </View>
    );
  }
}


const NavbarPropTypes = {
  navigateTo: PropTypes.func.isRequired,
  partnerUsername: PropTypes.string,
  loggedInUser: UserSchema,
};

export class Navbar extends Component {
  _pressBraidLogo = () => {
    if (this.props.loggedInUser) {
      this.props.navigateTo('chat');
    };
  }

  _pressBraidProfile = () => {
    this.props.navigateTo('settings');
  }

  render() {
    return (
      <View style={mainStyles.navbar}>
        <TouchableOpacity onPress={this._pressBraidLogo}>
          <Image style={mainStyles.navbarLogo}
                 source={require('../assets/img/poop_logo.jpeg')} />
        </TouchableOpacity>
        {this.props.loggedInUser && this.props.partnerUsername &&
          <Text style={[braidStyles.text, mainStyles.partnerUsername]}>
            {this.props.partnerUsername}
          </Text>
        }
        {this.props.loggedInUser &&
          <TouchableOpacity onPress={this._pressBraidProfile}>
            <Icon style={[braidStyles.icon, mainStyles.navbarSettings]} name='gear' />
          </TouchableOpacity>
        }
      </View>
    );
  }
}

Navbar.propTypes = NavbarPropTypes;


const ContentPropTypes = {
  navigateTo: PropTypes.func.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
  setPartnerUsername: PropTypes.func.isRequired,
  currentScene: PropTypes.string.isRequired,
  loggedInUser: UserSchema,
};

export class Content extends Component {
  render() {
    return (
      <View style={mainStyles.content}>
        {this.props.currentScene === 'login' &&
          <Login navigateTo={this.props.navigateTo}
                 setLoggedInUser={this.props.setLoggedInUser} />
        }
        {this.props.loggedInUser && this.props.currentScene === 'settings' &&
          <SettingsContainer navigateTo={this.props.navigateTo}
                             setLoggedInUser={this.props.setLoggedInUser}
                             loggedInUser={this.props.loggedInUser} />
        }
        {this.props.loggedInUser && this.props.currentScene === 'chat' &&
          <Chat navigateTo={this.props.navigateTo}
                setPartnerUsername={this.props.setPartnerUsername}
                loggedInUser={this.props.loggedInUser} />
        }
      </View>
    );
  }
}

Content.propTypes = ContentPropTypes;


const mainStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
    paddingTop: 20,
    paddingRight: 10,
    paddingLeft: 10,
    backgroundColor: '#DDD',
  },
  navbarLogo: {
    height: 40,
    width: 40,
  },
  partnerUsername: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navbarSettings: {
    fontSize: 40,
  },
  content: {
    flex: 1,
  },
});
