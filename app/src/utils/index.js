export function createConstants(...constants) {
    return constants.reduce((acc, constant) => {
        acc[constant] = constant;
        return acc;
    }, {});
}

export function checkHttpStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText)
        error.response = response
        throw error
    }
}

export function parseJSON(response) {
    return response.json()

}

export function getArrayIndex(val, arr, key='id') {
    let index = -1;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) {
            index = i;
            break;
        }
    }

    return index;
}

export function getArrayIndexWith2Keys(arr, key1, val1, key2, val2) {
    let index = -1;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key1] === val1 && arr[i][key2] === val2) {
            index = i;
            break;
        }
    }

    return index;
}

export function getSecondsFromDuration(duration) {
    const times = duration.split(':');
    let seconds = 0;
    if(times.length == 1) {
        seconds += parseInt(times[0]);
    }
    else if(times.length == 2) {
        seconds += parseInt(times[0]) * 60;
        seconds += parseInt(times[1]);
    }
    else if(times.length == 3) {
        seconds += parseInt(times[0]) * 3600;
        seconds += parseInt(times[1]) * 60;
        seconds += parseInt(times[2]);
    }

    return seconds;
}

export function getDurationFromTrack(track) {
    const metadata = JSON.parse(track.metadata).length ? JSON.parse(track.metadata)[0]: null;

    if(metadata && metadata.duration)
        return metadata.duration;
    else
        return false;
}

export function getObjectValue(obj, keys, defaultValue) {
    for(let i=0; i<keys.length; i++) {
        if(obj[keys[i]] !== undefined)
            obj = obj[keys[i]];
        else
            obj = defaultValue;
    }

    return obj;
}

export function getProviderById(id, providers) {
    let returnProvider = null;
    providers.every(provider => {
        if(provider.id == id) {
            returnProvider = provider;
            return false;
        }
        else
            return true;
    });

    return returnProvider;
}

export function getProviderIdByName(name, providers) {
    let providerId = 0;
    providers.every(provider => {
        if(provider.name.toLowerCase() == name) {
            providerId = provider.id;
            return false;
        }
        else
            return true;
    });

    return providerId;
}

export function parseNotificationMessageHtml(str) {
    let link = {
        html: false,
        obj: '',
        id: '',
        text: '',
        before: '',
        after: ''
    };

    if(!str || str == "")
        return link;

    let pos = str.indexOf('<a');
    let pos2 = str.indexOf('a>');
    if(pos === -1 || pos2 === -1)
        return link;

    let $html = $(str.substring(pos, pos2 + 2));

    link.obj = $html.data("obj");
    link.id = $html.data("oid");
    link.text = $html.text();
    link.before = str.substring(0, pos - 1);
    link.after = str.substring(pos2 + 3, str.length - 1);
    link.html = true;

    return link;
}

export function parseNotification(notification) {
    if(!notification.extra_data || notification.extra_data == "")
        return parseNotificationMessageHtml(notification.html);

    let extra = JSON.parse(notification.extra_data);
    let str = notification.html;

    let link = {
        html: false,
        obj: '',
        id: '',
        text: '',
        before: '',
        after: ''
    };

    let pos = str.indexOf('<a');
    let pos2 = str.indexOf('a>');
    if(pos === -1 || pos2 === -1)
        return link;

    link.obj = extra.object;
    link.id = extra.objectId;
    link.text = extra.objectText;
    link.before = str.substring(0, pos - 1);
    link.after = str.substring(pos2 + 3, str.length - 1);
    link.html = true;

    return link;
}

export function getTimeFromSeconds(times) {
    let h = parseInt(times / 3600);
    let m = parseInt((times - h * 3600) / 60);
    let s = times - h * 3600 - m * 60;

    return { h, m, s };
}

export function capitalize(s) {
    return s.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export function metamasher(track) {

  const metadata = JSON.parse(track.metadata).length ? JSON.parse(track.metadata)[0]: null;
  let pubdata = [];
  let video_title = track.title + " - " + track.subtitle;
  let video_description = "";
  //let video_tags = sw.removeStopwords(video_title);
  // Make sure all tags are lowercase
  //video_tags = video_tags.map(function(x) { return x.toLowerCase() });

  // TODO: Remove duplicate tags

  pubdata.push({
    'video_title': video_title,
    'video_description': video_description,
    'video_tags': video_tags,
  })

  return pubdata;
}

export function setNotificationsLastChecked() {
    
}
