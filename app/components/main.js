import React, { Component } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Button from 'react-native-button';

import Auth from './auth.js';
import Settings from './settings.js';


export default class BraidMobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentScene: 'auth',
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
                 currentScene={this.state.currentScene}/>
      </View>
    );
  }
}

export class Navbar extends Component {
  render() {
    return (
      <View style={mainStyles.navbar}>
        <Image style={mainStyles.navbarLogo}
               source={require('../assets/img/poop_logo.jpeg')} />
        {this.props.loggedInUser &&
          /* TODO: put an image component here which loads the logged in user's profile pic */
          <Text style={mainStyles.navbarUsername}>{this.props.loggedInUser.username}</Text>
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
        {this.props.currentScene === 'auth' &&
          <Auth navigateTo={this.props.navigateTo}
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
