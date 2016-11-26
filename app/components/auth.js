import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import Button from 'react-native-button';
import Hr from 'react-native-hr';
import Config from 'react-native-config';
import _ from 'lodash';

import braidStyles from '../styles.js';


export default class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginForm: {
        username: '',
        password: '',
      },
      loginDisabled: false,
      loginError: '',
    };
  }

  typeIntoUsername = usernameInput => {
    this.setState({loginForm: {...this.state.loginForm, username: usernameInput}});
  }

  typeIntoPassword = passwordInput => {
    this.setState({loginForm: {...this.state.loginForm, password: passwordInput}});
  }

  pressLogin = () => {
    this.setState({loginDisabled: true});
    const loginRoute = Config.BRAID_SERVER_URL + '/login';
    fetch(loginRoute, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.loginForm),
    })
      .then(loginRes => {
        return loginRes.json();
      })
      .then(loginJSON => {
        this.setState({loginDisabled: false});
        if (loginJSON.err) {
          const errorMessage = loginJSON.err.message;
          this.setState({loginError: errorMessage});
        } else {
          this.props.setLoggedInUser(loginJSON.user);
          this.setState({loginError: ''});
          this.props.navigateTo('settings');
        }
      })
      .catch(err => {
        this.setState({loginDisabled: false});
        this.setState({loginError: JSON.stringify(err)});
      });
  }

  render() {
    return (
      <View style={authStyles.authContainer}>
        <View style={braidStyles.formContainer}>
          <TextInput style={braidStyles.textInput}
                     onChangeText={text => this.typeIntoUsername(text)}
                     value={this.state.loginForm.username}
                     placeholder='Username'
                     keyboardType='default'/>
          <Hr lineColor='#DDD' />
          <TextInput style={braidStyles.textInput}
                     onChangeText={text => this.typeIntoPassword(text)}
                     value={this.state.loginForm.password}
                     placeholder='Password'
                     keyboardType='default'
                     secureTextEntry={true}/>
        </View>
        <Text style={authStyles.errorMessage}>{this.state.loginError}</Text>
        <Button style={[braidStyles.button, braidStyles.primaryButton]}
                styleDisabled={braidStyles.disabledButton}
                onPress={this.pressLogin}
                disabled={this.state.loginDisabled}>
          Login
        </Button>
      </View>
    );
  }
}

Auth.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  setLoggedInUser: React.PropTypes.func.isRequired,
};

const authStyles = StyleSheet.create({
  authContainer: {
    flex: 1,
    marginTop: 40,
  },
  errorMessage: {
    height: 20,
    margin: 10,
    color: 'red',
  },
});
