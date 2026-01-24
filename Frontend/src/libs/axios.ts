import { getServerUrl } from '@/utils/helpers';
import axios from 'axios';

const instance = axios.create({
  baseURL: getServerUrl(),
});

export default instance;
