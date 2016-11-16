import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  ListView,
  WebView,
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';


export class BraidMobile extends Component {
  render() {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.navbar}></View>
        <View style={styles.content}>
          <Text>Hello World</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  navbar: {
    backgroundColor: '#AAA',
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});

AppRegistry.registerComponent('BraidMobile', () => BraidMobile);
