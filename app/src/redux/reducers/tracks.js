/**
 * Created by jarosanger on 9/15/16.
 */
import R from 'ramda';
import { LOGOUT_USER, TRACKS_FAILURE, TRACKS_RESET, TRACKS_GET_REQUEST, TRACKS_GET_SUCCESS,
    TRACKS_SAVE_REQUEST, TRACKS_SAVE_SUCCESS, TRACKS_ADD_REQUEST, TRACKS_ADD_SUCCESS,
    TRACKS_DELETE_REQUEST, TRACKS_DELETE_SUCCESS, TRACKS_SCAN_REQUEST, TRACKS_SCAN_SUCCESS, 
    TRACKS_UPLOADING_SET, TRACKS_UPLOADING_REMOVE } from '../../constants';
import { getArrayIndex, getArrayIndexWith2Keys, getDurationFromTrack } from '../../utils';

const initialState = {
    statusText: null,
    status: null,
    tracks: [],
    uploadings: [],
    removeUploadings: [],
    addedTrack: null,
};

function tracks(state = initialState, action) {
    switch(action.type) {
        case LOGOUT_USER:
            return Object.assign({}, initialState);

        case TRACKS_FAILURE:
            return Object.assign({}, state, {
                'status': 'failed',
                'statusText': action.payload.statusText
            });
        case TRACKS_RESET:
            return Object.assign({}, initialState);
        case TRACKS_GET_REQUEST:
            return Object.assign({}, state, {
                'status': 'getting',
                'tracks': []
            });
        case TRACKS_GET_SUCCESS:
            let { tracks } = action.payload;
            return Object.assign({}, state, {
                'status': 'got',
                'tracks': tracks,
            });
        case TRACKS_ADD_REQUEST:
            return Object.assign({}, state, {
                'status': 'adding',
                'statusText': null,
            });

        case TRACKS_ADD_SUCCESS:
            var { uploadId, track, statusText } = action.payload;
            var { tracks, uploadings } = state;
            // var index = state.removeUploadings.indexOf(track.project + '_' + fileId);
            
            // if(index == -1) {
            var index = R.findIndex(R.propEq('id', track.id))(tracks);
            if (index === -1)
                tracks.push(track);
            else
                tracks[index] = track;

            index = getArrayIndexWith2Keys(uploadings, 'uploadId', uploadId, 'projectId', track.project.toString());
            if (index !== -1)
                uploadings.splice(index, 1);

            return Object.assign({}, state, {
                'status': 'added',
                'statusText': statusText,
                'uploadId': uploadId,
                'tracks': tracks.concat([]),
                'uploadings': uploadings.concat([]),
            });
            // }
            // else {
            //     return Object.assign({}, state, {
            //         'status': 'removeAddedTrack',
            //         'addedTrack': track,
            //     });
            // }

        case TRACKS_SAVE_REQUEST:
            return Object.assign({}, state, {
                'status': 'saving',
                'statusText': null,
            });
        case TRACKS_SAVE_SUCCESS:
            var { tracks } = state;
            var index = getArrayIndex(action.payload.track.id, tracks);
            if (index === -1)
                tracks.push(action.payload.track);
            else
                tracks[index] = action.payload.track;

            return Object.assign({}, state, {
                'status': 'saved',
                'statusText': action.payload.statusText,
                'tracks': tracks.concat([]),
            });

        case TRACKS_DELETE_REQUEST:
            return Object.assign({}, state, {
                'status': 'deleting',
                'statusText': null,
            });
        case TRACKS_DELETE_SUCCESS:
            var tracks = state.tracks.concat([]);
            action.payload.trackIds.forEach((trackId) => {
                var index = getArrayIndex(trackId, tracks);
                if(index !== -1)
                    tracks.splice(index, 1);
            });
            
            return Object.assign({}, state, {
                'status': 'deleted',
                'removedTrackIds': action.payload.trackIds,
                'tracks': tracks,
            });

        case TRACKS_UPLOADING_SET:
            var { projectId, uploadings } = action.payload;
            const otherUploadings = R.filter((file) => file.projectId !== projectId, state.uploadings);

            return Object.assign({}, state, {
                'status': 'setUploadings',
                'statusText': null,
                'uploadings': otherUploadings.concat(uploadings),
            });
        
        case TRACKS_UPLOADING_REMOVE:
            var { projectId, id } = action.payload;
            var { uploadings, removeUploadings } = state;
            
            var index = getArrayIndexWith2Keys(uploadings, 'uploadId', id, 'projectId', projectId);
            if(index !== -1)
                uploadings.splice(index, 1);
            
            // index = removeUploadings.indexOf(projectId + '_' + id);
            // if(index === -1)
            //     removeUploadings.push(projectId + '_' + id);

            return Object.assign({}, state, {
                'uploadings': uploadings.concat([]),
                // 'removeUploadings': [...removeUploadings],
            });

        case TRACKS_SCAN_REQUEST:
            return Object.assign({}, state, {
                'status': 'scanning',
                'statusText': null,
                'scanTrackId': action.payload.track.id
            });
            
        case TRACKS_SCAN_SUCCESS:
            var track = action.payload.track;
            var index = getArrayIndex(track.id, state.tracks);
            var tracks = state.tracks.concat([]);
            const duration = getDurationFromTrack(track);

            track.scanned = !duration? false: true;
            if (index === -1)
                tracks.push(track);
            else
                tracks[index] = track;

            const allScanned = tracks.every(track2 => track2.scanned != undefined);

            return Object.assign({}, state, {
                'status': allScanned? 'scanned': 'scanning',
                'statusText': null,
                'tracks': tracks,
                'scanTrackId': action.payload.track.id
            });

        default:
            return Object.assign({}, state);
    }
}

module.exports = {
    tracks,
};