import Config from 'react-native-config';


export const braidFetch = (...args) => {
  args[0] = Config.BRAID_SERVER_URL + args[0];
  return fetch(...args);
};

export const braidFetchJSON = (...args) => {
  return braidFetch(...args).then(res => res.json());
};
