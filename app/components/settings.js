import React, { Component } from 'react';
import { StyleSheet, View, PushNotificationIOS } from 'react-native';
import Button from 'react-native-button';
import Config from 'react-native-config';

import braidStyles from '../styles.js';


export default class Settings extends Component {
  constructor(props) {
    super(props);
    PushNotificationIOS.addEventListener('register', token => {
      this.checkNotificationsEnabled();
      const userId = this.props.loggedInUser._id;
      if (userId) {
        const deviceInfo = {
          device_id: token,
          platform: 'ios',
        };
        fetch(Config.BRAID_SERVER_URL + '/api/addDeviceIDForUser/' + userId, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deviceInfo),
        })
          .then(addDeviceIDRes => {
            console.log('addDeviceIDRes', addDeviceIDRes);
          });
      }
    });
    this.checkNotificationsEnabled();
    PushNotificationIOS.requestPermissions({alert: 1, badge: 1});
  }

  checkNotificationsEnabled() {
    PushNotificationIOS.checkPermissions(permissions => {
      if (!(permissions.alert && permissions.badge)) {
        this.setState({notificationsEnabled: false});
      }
    });
  }

  pressLogout() {
    fetch(Config.BRAID_SERVER_URL + '/logout')
      .then(logoutRes => {
        if (logoutRes.status === 200) {
          this.props.setLoggedInUser({});
          this.props.navigateTo('auth');
        }
      });
  }

  render() {
    return (
      <View style={styles.settingsContainer}>
        {/* TODO: if notifications are not enabled, display a message saying to enable them in the phone's Settings (the Notifications section) */}
        <Button style={[braidStyles.button, braidStyles.primaryButton, styles.settingsButton]}
                onPress={() => this.pressLogout()}>
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

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
  },
  settingsButton: {
    marginTop: 40,
  },
});
