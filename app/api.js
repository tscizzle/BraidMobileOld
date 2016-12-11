import Config from 'react-native-config';


const BRAID_SERVER_URL = Config ? Config.BRAID_SERVER_URL : 'https://preetybraid-staging.herokuapp.com';

export default braidFetch = (...args) => {
  args[0] = BRAID_SERVER_URL + args[0];
  return fetch(...args);
};
