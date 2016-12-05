import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import Button from 'react-native-button';
import Config from 'react-native-config';
import _ from 'lodash';

import UserSchema from '../models/user.js';
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
    };
  }

  _navigateTo = scene => this.setState({currentScene: scene});

  _setLoggedInUser = user => this.setState({loggedInUser: user});

  render() {
    return (
      <View style={mainStyles.mainContainer}>
        <Navbar navigateTo={this._navigateTo}
                loggedInUser={this.state.loggedInUser} />
        <Content navigateTo={this._navigateTo}
                 setLoggedInUser={this._setLoggedInUser}
                 currentScene={this.state.currentScene}
                 loggedInUser={this.state.loggedInUser} />
      </View>
    );
  }
}


const NavbarPropTypes = {
  navigateTo: PropTypes.func.isRequired,
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
        {this.props.loggedInUser &&
          <TouchableOpacity style={mainStyles.navbarProfile}
                            onPress={this._pressBraidProfile}>
            <Text style={[braidStyles.text, mainStyles.navbarUsername]}>
              {this.props.loggedInUser.username}
            </Text>
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
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#DDD',
  },
  navbarLogo: {
    height: 40,
    width: 40,
  },
  navbarProfile: {
    flexDirection: 'row',
  },
  navbarUsername: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});
