import axios from 'axios';
import { getProxy } from './getProxy';

export async function fetchJson<T>(url: string, expectArray: boolean = false) {
  try {
    const response = await axios.get<T>(getProxy() + url);
    return response.data as T;
  } catch (e) {
    console.error(e);
    return expectArray ? ([] as T) : ({} as T);
  }
}
