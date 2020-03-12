/**
 * Created by jarosanger on 9/15/16.
 */
import cookie from 'react-cookie';
import { TRACKS_FAILURE, TRACKS_GET_REQUEST, TRACKS_GET_SUCCESS, TRACKS_SAVE_REQUEST, TRACKS_SAVE_SUCCESS,
    TRACKS_ADD_REQUEST, TRACKS_ADD_SUCCESS, TRACKS_DELETE_REQUEST, TRACKS_DELETE_SUCCESS,
    TRACKS_SCAN_REQUEST, TRACKS_SCAN_SUCCESS, TRACKS_UPLOADING_SET, TRACKS_UPLOADING_REMOVE } from '../../constants';
import { sendRequest } from '../../services/requests';
import { getDurationFromTrack } from '../../utils';

function rawAction() {
    return {
        type: 'RAW_ACTION',
    }
}

function failTracks(errorText) {
    return {
        type: TRACKS_FAILURE,
        payload: {
            statusText: errorText
        }
    }
}

function tracksSaveSuccess(track) {
    return {
        type: TRACKS_SAVE_SUCCESS,
        payload: {
            track: track,
            statusText: 'Your track has been saved successfully!'
        }
    }
}

function tracksAddSuccess(track, uploadId) {
    return {
        type: TRACKS_ADD_SUCCESS,
        payload: {
            track,
            uploadId,
            statusText: 'Your track has been added successfully!'
        }
    }
}

function tracksDeleteSuccess(trackIds, multi=false) {
    return {
        type: TRACKS_DELETE_SUCCESS,
        payload: {
            trackIds: multi? trackIds: [trackIds]
        }
    }
}

function tracksGetSuccess(tracks) {
    return {
        type: TRACKS_GET_SUCCESS,
        payload: {
            tracks,
        }
    }
}

function getTracks(projectId) {
    return sendRequest({
        method: 'GET',
        url: 'projects/' + projectId + '/tracks/',
        before: { type: TRACKS_GET_REQUEST },
        success: function(response) {
            return tracksGetSuccess(response.data);
        },
        fail: function(errorData) {
            return failTracks('It has been failed to get track files.');
        }
    });
}

function createTrack(projectId, file) {
    const userId = cookie.load('userId');
    const metadata = [{
        size: file.size, mimetype: file.mimetype
    }];

    return sendRequest({
        method: 'POST',
        url: 'projects/' + projectId + '/tracks/',
        data: { project: projectId, user: userId, audio_file: file.url, metadata: JSON.stringify(metadata), title: file.filename},
        before: { type: TRACKS_ADD_REQUEST, payload: { uploadId: file.uploadId } },
        success: function(response) {
            return tracksAddSuccess(response.data, file.uploadId);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return failTracks(errorData.details);
            }
            else {
                return failTracks("It has been failed to create track.");
            }
        }
    });
}

function removeTrack(projectId, trackId) {
    return sendRequest({
        method: 'DELETE',
        url: 'projects/' + projectId + '/tracks/' + trackId + '/',
        before: { type: TRACKS_DELETE_REQUEST },
        success: function(response) {
            return tracksDeleteSuccess(trackId);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return failTracks(errorData.details);
            }
            else {
                return failTracks("Failed to remove track.");
            }
        }
    });
}

function removeRawTrack(track) {
    return sendRequest({
        method: 'DELETE',
        url: 'projects/' + track.project + '/tracks/' + track.id + '/',
        success: function(response) {
            return rawAction();
        },
        fail: function(errorData) {
            return rawAction();
        }
    });
}

function deleteTracks(projectId, trackIds) {
    return sendRequest({
        method: 'POST',
        url: 'projects/' + projectId + '/tracks/bulk/delete/',
        data: {track_ids: trackIds.join()},
        before: { type: TRACKS_DELETE_REQUEST },
        success: function(response) {
            return tracksDeleteSuccess(trackIds, true);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return failTracks(errorData.details);
            }
            else {
                return failTracks("Failed to remove track.");
            }
        }
    });
}

function editTrack(track) {
    return sendRequest({
        method: 'PUT',
        url: 'projects/' + track.project + '/tracks/' + track.id + '/',
        data: track,
        before: { type: TRACKS_SAVE_REQUEST },
        success: function(response) {
            return tracksSaveSuccess(response.data);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return failTracks(errorData.details);
            }
            else {
                return failTracks("It has been failed to save track.");
            }
        }
    });
}

function setUploadings(projectId, uploadings) {
    return dispatch => {
        dispatch({
            type: TRACKS_UPLOADING_SET,
            payload: {
                projectId, 
                uploadings,
            }
        });
    }
}

function removeUploading(projectId, id) {
    return dispatch => {
        dispatch({
            type: TRACKS_UPLOADING_REMOVE,
            payload: {
                projectId, 
                id,
            }
        });
    }
}

function tracksScanSuccess(track) {
    return {
        type: TRACKS_SCAN_SUCCESS,
        payload: {
            track: track
        }
    }
}

function scanTrack(track) {
    if(getDurationFromTrack(track)) {
        return dispatch => {
            dispatch(tracksScanSuccess(track));
        }
    }

    return sendRequest({
        method: 'GET',
        url: 'projects/' + track.project + '/tracks/' + track.id + '/scan/',
        before: { type: TRACKS_SCAN_REQUEST, payload: { track: track } },
        success: function(response) {
            return tracksScanSuccess(response.data);
        },
        fail: function(errorData) {
            return tracksScanSuccess(track);
        }
    });
}

module.exports = {
    failTracks,
    getTracks,
    createTrack,
    editTrack,
    removeTrack,
    removeRawTrack,
    setUploadings,
    removeUploading,
    deleteTracks,
    scanTrack,
};
