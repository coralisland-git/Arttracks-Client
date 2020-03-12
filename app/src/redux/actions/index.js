import auth from './auth';
import profile from './profile';
import videos from './videos';
import project from './project';
import artwork from './artwork';
import tracks from './tracks';
import build from './build';
import provider from './provider';
import loading from './loading';
import notifications from './notifications';
import publish from './publish';
import plan from './plan';
import popup from './popup';
import buy from './buy';
import payment from './payment';
import billing from './billing';
import paying from './paying';
import coupon from './coupon';

module.exports = {
    ...auth,
    ...profile,
    ...videos,
    ...project,
    ...artwork,
    ...tracks,
    ...build,
    ...provider,
    ...loading,
    ...notifications,
    ...publish,
    ...plan,
    ...popup,
    ...buy,
    ...payment,
    ...billing,
    ...paying,
    ...coupon,
};
