import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text, ListView, TouchableOpacity } from 'react-native';
import Hr from 'react-native-hr';
import _ from 'lodash';

import UserSchema from '../models/user.js';
import FriendshipSchema from '../models/friendship.js';
import ConvoSchema from '../models/convo.js';
import { partnerFromFriendship,
         convoFromFriendship } from '../helpers.js';
import { braidFetchJSON } from '../api.js';
import braidStyles from '../styles.js';


const FriendshipsContainerPropTypes = {
  navigateTo: PropTypes.func.isRequired,
  chatNavigateTo: PropTypes.func.isRequired,
  setConvo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
};

export default class FriendshipsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {friendships: []};
  }

  componentDidMount() {
    const userID = this.props.loggedInUser._id;
    braidFetchJSON('/api/friendships/' + userID)
      .then(friendshipsJSON => {
        braidFetchJSON('/api/convos/' + userID)
          .then(convosJSON => {
            const acceptedFriendships = _.filter(friendshipsJSON, friendship => friendship.status === 'accepted');
            const sortedFriendships = _.sortBy(acceptedFriendships, friendship => {
              const convo = convoFromFriendship(friendship, convosJSON);
              if (convo) {
                return -(new Date(convo.last_message_time));
              }
            });
            this.setState({friendships: sortedFriendships});
          })
          .catch(err => console.log('get convos err', err));
      })
      .catch(err => console.log('get friendships err', err));
  }

  render() {
    return (
      <Friendships chatNavigateTo={this.props.chatNavigateTo}
                   setConvo={this.props.setConvo}
                   loggedInUser={this.props.loggedInUser}
                   friendships={this.state.friendships} />
    );
  }
}

FriendshipsContainer.propTypes = FriendshipsContainerPropTypes;


const FriendshipsPropTypes = {
  chatNavigateTo: PropTypes.func.isRequired,
  setConvo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  friendships: PropTypes.arrayOf(FriendshipSchema).isRequired,
};

export class Friendships extends Component {
  constructor(props) {
    super(props);
    const friendshipsDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {friendshipsDataSource: friendshipsDataSource.cloneWithRows(this.props.friendships)};
  }

  componentWillReceiveProps(nextProps) {
    const newFriendships = nextProps.friendships;
    this.setState({friendshipsDataSource: this.state.friendshipsDataSource.cloneWithRows(newFriendships)});
  }

  _renderFriendship = friendship => <Friendship chatNavigateTo={this.props.chatNavigateTo}
                                                setConvo={this.props.setConvo}
                                                loggedInUser={this.props.loggedInUser}
                                                friendship={friendship}
                                                key={friendship._id} />;

  _renderFriendshipSeparator = (sectionID, rowID) => <Hr lineColor='#DDD' key={rowID} />;

  render() {
    return (
      <View style={friendshipsStyles.friendshipsList}>
        <ListView dataSource={this.state.friendshipsDataSource}
                  renderRow={this._renderFriendship}
                  renderSeparator={this._renderFriendshipSeparator}
                  enableEmptySections={true} />
      </View>
    );
  }
}

Friendships.propTypes = FriendshipsPropTypes;


const FriendshipPropTypes = {
  chatNavigateTo: PropTypes.func.isRequired,
  setConvo: PropTypes.func.isRequired,
  loggedInUser: UserSchema.isRequired,
  friendship: FriendshipSchema.isRequired,
};

export class Friendship extends Component {
  constructor(props) {
    super(props);
    this.state = {
      partnerUsername: null,
      partnerProfilePic: null,
    };
  }

  componentDidMount() {
    const partnerID = partnerFromFriendship(this.props.loggedInUser, this.props.friendship);
    braidFetchJSON('/api/username/' + partnerID)
      .then(usernameJSON => {
        const partnerUsername = usernameJSON.username;
        this.setState({partnerUsername});
      })
      .catch(err => console.log('get partner username err', err));
  }

  _pressFriendship = () => {
    const userID_0 = this.props.friendship.requester_id;
    const userID_1 = this.props.friendship.target_id;
    braidFetchJSON('/api/convoFromUsers/' + userID_0 + '/' + userID_1)
      .then(convoJSON => {
        this.props.setConvo(convoJSON);
        this.props.chatNavigateTo('messages');
      })
      .catch(err => console.log('get convo err', err));
  }

  render() {
    return (
      <TouchableOpacity style={friendshipsStyles.friendshipRow}
                        onPress={this._pressFriendship}>
        <Text style={braidStyles.text}> {this.state.partnerUsername} </Text>
      </TouchableOpacity>
    );
  }
}

Friendship.PropTypes = FriendshipPropTypes;


const friendshipsStyles = StyleSheet.create({
  friendshipsList: {
    flex: 1,
  },
  friendshipRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 20,
  },
});
