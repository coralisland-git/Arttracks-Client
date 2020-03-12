import R from 'ramda';
import moment from 'moment';
import cookie from 'react-cookie';
import { MAX_VERIFY_COUNT } from '../constants';

export function VerifyCounter(key) {
  const getBuffer = () => {
    let buffer = cookie.load(key);

    if(buffer)
      return buffer.split(',');
    else
      return [];
  }

  const filter = (buffer) => R.filter((time) => (moment().diff(new Date(time), 'minutes') < 30), buffer);

  const clear = () => {
    cookie.save(key, '', { path: '/' });
  }

  const append = () => {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const buffer = getBuffer();

    buffer.push(now);
    cookie.save(key, buffer.join(), { path: '/' });
  }

  const check = () => {
    const buffer = filter(getBuffer());
    
    cookie.save(key, buffer.join(), { path: '/' });

    return buffer.length < MAX_VERIFY_COUNT;
  }

  const count = () => {
    const buffer = filter(getBuffer());

    return buffer.length;
  }

  return {
    clear,
    check,
    append,
    count,
  }
}