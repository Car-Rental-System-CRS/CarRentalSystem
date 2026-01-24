import { getServerUrl } from '@/lib/utils';
import axios from 'axios';

const instance = axios.create({
  baseURL: getServerUrl(),
});

export default instance;
