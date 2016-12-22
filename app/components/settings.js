import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, Image, PushNotificationIOS } from 'react-native';
import Button from 'react-native-button';
import Keychain from 'react-native-keychain';

import UserSchema from '../models/user.js';
import { jsonHeaders } from '../helpers.js';
import { braidFetch, braidFetchJSON } from '../api.js';
import braidStyles from '../styles.js';


const SettingsContainerPropTypes = {
  navigateTo: PropTypes.func.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
};

export default class SettingsContainer extends Component {
  constructor(props) {
    super(props);
     // TODO: make a default profile pic, the dummy pic in the web app
    this.state = {profilePicURL: null};
  }

  componentDidMount() {
    const userID = this.props.loggedInUser._id;
    const accountSettingsRoute = '/api/account_settings/' + userID;
    braidFetchJSON(accountSettingsRoute)
      .then(accountSettingsJSON => {
        const profilePicURL = accountSettingsJSON.profile_pic_url;
        if (profilePicURL) {
          this.setState({profilePicURL});
        }
      })
      .catch(err => console.log('get account settings err', err));
  }

  render() {
    return (
      <Settings navigateTo={this.props.navigateTo}
                setLoggedInUser={this.props.setLoggedInUser}
                loggedInUser={this.props.loggedInUser}
                profilePicURL={this.state.profilePicURL} />
    );
  }
}

SettingsContainer.propTypes = SettingsContainerPropTypes;


const SettingsPropTypes = {
  navigateTo: PropTypes.func.isRequired,
  setLoggedInUser: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  profilePicURL: PropTypes.string,
};

export class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {notificationsEnabled: true};
  }

  componentWillMount() {
    PushNotificationIOS.requestPermissions({alert: 1, badge: 1});
    PushNotificationIOS.addEventListener('register', this._onNotificationRegister);
    this._refreshNotificationsEnabled();
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('register', this._onNotificationRegister);
  }

  _onNotificationRegister = token => {
    this._refreshNotificationsEnabled();
    const userID = this.props.loggedInUser._id;
    const addDeviceRoute = '/api/addDeviceIDForUser/' + userID;
    const deviceInfo = {device_id: token, platform: 'ios'};
    braidFetch(addDeviceRoute, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(deviceInfo),
    })
      .catch(err => console.log('add device err', err));
  }

  _refreshNotificationsEnabled = () => {
    PushNotificationIOS.checkPermissions(permissions => {
      this.setState({notificationsEnabled: permissions.alert && permissions.badge});
    });
  }

  _pressLogout = () => {
    braidFetch('/logout')
      .then(logoutRes => {
        if (logoutRes.status === 200) {
          Keychain.resetGenericPassword();
          this.props.setLoggedInUser(null);
          this.props.navigateTo('login');
        }
      });
  }

  render() {
    return (
      <View style={settingsStyles.settingsContainer}>
        <View style={settingsStyles.profilePicContainer}>
          {this.props.profilePicURL &&
            <Image style={settingsStyles.profilePic}
                   source={{uri: this.props.profilePicURL}} />
          }
        </View>
        {!this.state.notificationsEnabled &&
          <View style={settingsStyles.settingsButtonContainer}>
            <Button style={[braidStyles.button, braidStyles.primaryButton]}
                    onPress={() => Linking.openURL('app-settings:')}>
              Enable Notifications
            </Button>
          </View>
        }
        <View style={settingsStyles.settingsButtonContainer}>
          <Button style={[braidStyles.button, braidStyles.primaryButton]}
                  onPress={this._pressLogout}>
            Logout
          </Button>
        </View>
      </View>
    );
  }
}

Settings.propTypes = SettingsPropTypes;


const settingsStyles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
  },
  settingsButtonContainer: {
    marginTop: 40,
  },
  profilePicContainer: {
    alignItems: 'center',
    height: 200,
    marginTop: 40,
  },
  profilePic: {
    height: 200,
    width: 200,
    borderRadius: 100,
  },
});
