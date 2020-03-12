import cookie from 'react-cookie';
import moment from 'moment';

const get = (id) => {
    const userId = cookie.load('userId');
    let lastChecked = cookie.load('notifications_last_checked' + userId);

    if(lastChecked) {
        lastChecked = parseInt(lastChecked);
    }
    else {
        lastChecked = 0;
    }

    return lastChecked;
}

const set = () => {
    const userId = cookie.load('userId');
    const now = moment().format('X');
    
    cookie.save('notifications_last_checked' + userId, now, { path: '/' });
}

const count = (notifications) => {
    let unreadCount = 0;
    const lastChecked = get();

    notifications.forEach(notification => {
        if(notification.creation_date) {
            const timestamp = moment(notification.creation_date).format('X');
            if(lastChecked < timestamp)
                unreadCount++;
        }
    });

    return unreadCount;
}

export default {
    set,
    count,
}
