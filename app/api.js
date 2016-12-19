import Config from 'react-native-config';


// Config is only defined in dev (ideally would detect dev or prod a more robust way)
const BRAID_SERVER_URL = Config ? Config.BRAID_SERVER_URL : 'https://www.braid.space';

export const braidFetch = (...args) => {
  args[0] = BRAID_SERVER_URL + args[0];
  return fetch(...args);
};

export const braidFetchJSON = (...args) => {
  return braidFetch(...args).then(res => res.json());
};
