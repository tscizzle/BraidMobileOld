import React, { Component } from 'react';
import { StyleSheet, View, Text, Linking, ListView } from 'react-native';
import Button from 'react-native-button';
import Config from 'react-native-config';

import UserSchema from '../models/user.js';
import FriendshipSchema from '../models/friendship.js';

import { partnerFromFriendship } from '../helpers.js';
import braidStyles from '../styles.js';


export default class Friendships extends Component {
  constructor(props) {
    super(props);
    this.state = {friendships: []};
  }

  componentWillMount() {
    const userId = this.props.loggedInUser._id;
    fetch(Config.BRAID_SERVER_URL + '/api/friendships/' + userId)
      .then(friendshipsRes => {
        return friendshipsRes.json();
      })
      .then(friendshipsJSON => {
        this.setState({friendships: friendshipsJSON});
      })
      .catch(err => console.log('get friendships err', err));
  }

  render() {
    return (
      <View style={friendshipsStyles.friendshipsContainer}>
        <FriendshipsList loggedInUser={this.props.loggedInUser}
                         friendships={this.state.friendships} />
      </View>
    );
  }
}

Friendships.propTypes = {
  navigateTo: React.PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
};


export class FriendshipsList extends Component {
  constructor(props) {
    super(props);
    const friendshipsDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {friendshipsDataSource: friendshipsDataSource.cloneWithRows(this.props.friendships)};
  }

  componentWillReceiveProps(nextProps) {
    const newFriendships = nextProps.friendships;
    this.setState({friendshipsDataSource: this.state.friendshipsDataSource.cloneWithRows(newFriendships)});
  }

  _renderFriendshipInList = friendship => {
    return (
      <FriendshipInList loggedInUser={this.props.loggedInUser}
                        friendship={friendship} />
    );
  }

  render() {
    return (
      // TODO: display each friendship's partner username (the username of the user who's not the logged in user)
      <ListView dataSource={this.state.friendshipsDataSource}
                renderRow={this._renderFriendshipInList} />
    );
  }
}

FriendshipsList.propTypes = {
  loggedInUser: UserSchema.isRequired,
  friendships: React.PropTypes.arrayOf(FriendshipSchema).isRequired,
};


export class FriendshipInList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      partnerUsername: null,
      partnerProfilePic: null,
    };
  }

  render() {
    const partnerID = partnerFromFriendship(this.props.loggedInUser, this.props.friendship);
    return (
      <Text> {partnerID} ({this.props.friendship.status}) </Text>
    );
  }
}

FriendshipInList.propTypes = {
  loggedInUser: UserSchema.isRequired,
  friendship: FriendshipSchema.isRequired,
};


const friendshipsStyles = StyleSheet.create({
  friendshipsContainer: {
    flex: 1,
  },
});
