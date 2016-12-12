import Config from 'react-native-config';


// TODO: need the right side of the : to actually be a mock for test purposes
const BRAID_SERVER_URL = Config ? Config.BRAID_SERVER_URL : 'https://preetybraid-staging.herokuapp.com';

export const braidFetch = (...args) => {
  args[0] = BRAID_SERVER_URL + args[0];
  return fetch(...args);
};

export const braidFetchJSON = (...args) => {
  return braidFetch(...args).then(res => res.json());
};
