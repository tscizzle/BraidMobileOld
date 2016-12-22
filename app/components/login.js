import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, TextInput, PushNotificationIOS } from 'react-native';
import Button from 'react-native-button';
import Hr from 'react-native-hr';
import Keychain from 'react-native-keychain';

import { braidFetchJSON } from '../api.js';
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
      autoLoginAttempted: false,
    };
  }

  componentDidMount() {
    Keychain.getGenericPassword()
      .then(credentials => {
        this.setState({loginForm: credentials}, this._pressLogin);
      })
      .catch(err => {
        console.log('get credentials err', err);
        this.setState({autoLoginAttempted: true});
      });
  }

  _typeIntoUsername = usernameInput => {
    this.setState({loginForm: {...this.state.loginForm, username: usernameInput}});
  }

  _typeIntoPassword = passwordInput => {
    this.setState({loginForm: {...this.state.loginForm, password: passwordInput}});
  }

  _pressLogin = () => {
    this.setState({loginDisabled: true});
    braidFetchJSON('/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.loginForm),
    })
      .then(loginJSON => {
        this.setState({loginDisabled: false});
        if (loginJSON.err) {
          const errorMessage = loginJSON.err.message;
          this.setState({loginError: errorMessage});
        } else {
          this.props.setLoggedInUser(loginJSON.user);
          Keychain.setGenericPassword(this.state.loginForm.username, this.state.loginForm.password);
          // TODO: if notifications enabled, go to chat instead of settings
          PushNotificationIOS.checkPermissions(permissions => {
            const targetScene = permissions.alert && permissions.badge ? 'chat' : 'settings';
            this.props.navigateTo(targetScene);
          });
        }
      })
      .catch(err => {
        this.setState({loginDisabled: false});
        console.log('login err', err);
        this.setState({loginError: JSON.stringify(err)});
      });
  }

  render() {
    return (
      /* TODO: instead of the login form put a loading screen here unless this.state.autoLoginAttempted is true */
      this.state.autoLoginAttempted &&
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
    height: 60,
    margin: 10,
    color: 'red',
  },
});
