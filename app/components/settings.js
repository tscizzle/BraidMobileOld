import React, { Component } from 'react';
import { StyleSheet, View, Text, Linking, PushNotificationIOS } from 'react-native';
import Button from 'react-native-button';
import Config from 'react-native-config';
import Keychain from 'react-native-keychain';

import braidStyles from '../styles.js';


export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {notificationsEnabled: true};
  }

  componentWillMount() {
    PushNotificationIOS.requestPermissions({alert: 1, badge: 1});
    PushNotificationIOS.addEventListener('register', this.onNotificationRegister);
    this.refreshNotificationsEnabled();
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('register', this.onNotificationRegister);
  }

  onNotificationRegister = token => {
    this.refreshNotificationsEnabled();
    const userId = this.props.loggedInUser._id;
    if (userId) {
      const addDeviceRoute = Config.BRAID_SERVER_URL + '/api/addDeviceIDForUser/' + userId;
      const deviceInfo = {device_id: token, platform: 'ios'};
      fetch(addDeviceRoute, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceInfo),
      })
        .catch(err => console.log('add device err', err));
    }
  }

  refreshNotificationsEnabled = () => {
    PushNotificationIOS.checkPermissions(permissions => {
      this.setState({notificationsEnabled: permissions.alert && permissions.badge});
    });
  }

  pressLogout = () => {
    fetch(Config.BRAID_SERVER_URL + '/logout')
      .then(logoutRes => {
        if (logoutRes.status === 200) {
          Keychain.resetGenericPassword();
          this.props.setLoggedInUser({});
          this.props.navigateTo('login');
        }
      });
  }

  render() {
    const notificationsNotEnabled = !this.state.notificationsEnabled;
    return (
      <View style={settingsStyles.settingsContainer}>
        {notificationsNotEnabled &&
          <Button style={[braidStyles.button, braidStyles.primaryButton, settingsStyles.settingsButton]}
                  onPress={() => Linking.openURL('app-settings:')}>
            Enable Notifications
          </Button>
        }
        <Button style={[braidStyles.button, braidStyles.primaryButton, settingsStyles.settingsButton]}
                onPress={this.pressLogout}>
          Logout
        </Button>
      </View>
    );
  }
}

Settings.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  setLoggedInUser: React.PropTypes.func.isRequired,
  loggedInUser: React.PropTypes.object.isRequired,
};


const settingsStyles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
  },
  settingsButton: {
    marginTop: 40,
  },
});
