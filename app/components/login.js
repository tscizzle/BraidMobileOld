import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import Button from 'react-native-button';
import Hr from 'react-native-hr';
import Config from 'react-native-config';
import Keychain from 'react-native-keychain';

import braidStyles from '../styles.js';


const LoginPropTypes = {
  navigateTo: PropTypes.func.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
};

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginForm: {
        username: '',
        password: '',
      },
      loginDisabled: false,
      loginError: null,
    };
  }

  componentWillMount() {
    Keychain.getGenericPassword()
      .then(credentials => {
        this.setState({loginForm: credentials});
        this._pressLogin();
      })
      .catch(err => console.log('get credentials err', err));
  }

  _typeIntoUsername = usernameInput => {
    this.setState({loginForm: {...this.state.loginForm, username: usernameInput}});
  }

  _typeIntoPassword = passwordInput => {
    this.setState({loginForm: {...this.state.loginForm, password: passwordInput}});
  }

  _pressLogin = () => {
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
          Keychain.setGenericPassword(this.state.loginForm.username, this.state.loginForm.password);
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
      <View style={loginStyles.loginContainer}>
        <View style={braidStyles.formContainer}>
          <TextInput style={braidStyles.textInput}
                     onChangeText={this._typeIntoUsername}
                     value={this.state.loginForm.username}
                     placeholder='Username' />
          <Hr lineColor='#DDD' />
          <TextInput style={braidStyles.textInput}
                     onChangeText={this._typeIntoPassword}
                     value={this.state.loginForm.password}
                     placeholder='Password'
                     secureTextEntry={true} />
        </View>
        <Text style={[braidStyles.text, loginStyles.errorMessage]}>{this.state.loginError}</Text>
        <Button style={[braidStyles.button, braidStyles.primaryButton]}
                styleDisabled={braidStyles.disabledButton}
                onPress={this._pressLogin}
                disabled={this.state.loginDisabled}>
          Login
        </Button>
      </View>
    );
  }
}

Login.PropTypes = LoginPropTypes;


const loginStyles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    marginTop: 40,
  },
  errorMessage: {
    height: 20,
    margin: 10,
    color: 'red',
  },
});
