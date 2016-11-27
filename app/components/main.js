import React, { Component } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Button from 'react-native-button';
import Config from 'react-native-config';
import _ from 'lodash';

import Login from './login.js';
import Settings from './settings.js';


export default class BraidMobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentScene: 'login',
      loggedInUser: {},
    };
  }

  navigateTo = scene => this.setState({currentScene: scene});

  setLoggedInUser = user => this.setState({loggedInUser: user});

  render() {
    return (
      <View style={mainStyles.mainContainer}>
        <Navbar loggedInUser={this.state.loggedInUser} />
        <Content navigateTo={this.navigateTo}
                 setLoggedInUser={this.setLoggedInUser}
                 loggedInUser={this.state.loggedInUser}
                 currentScene={this.state.currentScene} />
      </View>
    );
  }
}


export class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {profilePicSource: null};
  }

  componentWillMount() {
    this.refreshProfilePic(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.refreshProfilePic(newProps);
  }

  refreshProfilePic = props => {
    const userId = props.loggedInUser._id;
    if (userId) {
      const accountSettingsRoute = Config.BRAID_SERVER_URL + '/api/account_settings/' + userId;
      fetch(accountSettingsRoute)
        .then(accountSettingsRes => {
          return accountSettingsRes.json();
        })
        .then(accountSettingsJSON => {
          const profilePicURL = accountSettingsJSON.profile_pic_url;
          if (profilePicURL) {
            this.setState({profilePicSource: {uri: profilePicURL}});
          }
        });
    }
  }

  render() {
    const showNavbarProfile = !_.isEmpty(this.props.loggedInUser);
    return (
      <View style={mainStyles.navbar}>
        <Image style={mainStyles.navbarLogo}
               source={require('../assets/img/poop_logo.jpeg')} />
        {showNavbarProfile &&
          <View style={mainStyles.navbarProfile}>
            <Image style={mainStyles.navbarProfilePic}
                   source={this.state.profilePicSource} />
            <Text style={mainStyles.navbarUsername}>{this.props.loggedInUser.username}</Text>
          </View>
        }
      </View>
    );
  }
}

Navbar.propTypes = {
  loggedInUser: React.PropTypes.object.isRequired,
};


export class Content extends Component {
  render() {
    return (
      <View style={mainStyles.content}>
        {this.props.currentScene === 'login' &&
          <Login navigateTo={this.props.navigateTo}
                 setLoggedInUser={this.props.setLoggedInUser} />
        }
        {this.props.currentScene === 'settings' &&
          <Settings navigateTo={this.props.navigateTo}
                    setLoggedInUser={this.props.setLoggedInUser}
                    loggedInUser={this.props.loggedInUser} />
        }
      </View>
    );
  }
}

Content.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  setLoggedInUser: React.PropTypes.func.isRequired,
  loggedInUser: React.PropTypes.object.isRequired,
  currentScene: React.PropTypes.string.isRequired,
};


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
  navbarProfilePic: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  navbarUsername: {
    padding: 10,
    fontSize: 20,
    color: '#555',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});
