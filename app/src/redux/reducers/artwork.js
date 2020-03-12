/**
 * Created by jarosanger on 10/15/16.
 */
import { LOGOUT_USER, ARTWORK_FAILURE, ARTWORK_RESET, ARTWORK_RESET_SETTING,
    ARTWORK_CREATE_REQUEST, ARTWORK_CREATE_SUCCESS, 
    ARTWORK_UPDATE_REQUEST, ARTWORK_UPDATE_SUCCESS, 
    ARTWORK_DELETE_REQUEST, ARTWORK_DELETE_SUCCESS,
    ARTWORK_GET_REQUEST, ARTWORK_GET_SUCCESS, ARTWORK_SET_SUCCESS,
    ARTWORK_TEMPLATE_GET_REQUEST, ARTWORK_TEMPLATE_GET_SUCCESS } from '../../constants';
import { getArrayIndex } from '../../utils';

const initialState = {
    statusText: null,
    status: null,
    setting: null,
    artworks: [],
    templates: [],
};

function artwork(state = initialState, action) {
    switch(action.type) {
        case LOGOUT_USER:
            return Object.assign({}, initialState);

        case ARTWORK_FAILURE:
            return Object.assign({}, state, {
                'status': 'failed',
                'statusText': action.payload.statusText
            });
        case ARTWORK_RESET:
            return Object.assign({}, initialState);
        case ARTWORK_RESET_SETTING:
            return Object.assign({}, state, {
                'statusText': null,
                'status': null,
                'setting': null,
            });
        case ARTWORK_CREATE_REQUEST:
            return Object.assign({}, state, {
                'status': 'saving'
            });
        case ARTWORK_CREATE_SUCCESS:
            var artworks = state.artworks.concat([]);
            if(action.payload) {
                artworks.push(action.payload);
            }
            return Object.assign({}, state, {
                'status': 'saved',
                'statusText': 'Your project artwork has been saved successfully!',
                'artworks': artworks
            });
        case ARTWORK_UPDATE_REQUEST:
            return Object.assign({}, state, {
                'status': 'updating'
            });
        case ARTWORK_UPDATE_SUCCESS:
            var artworks = state.artworks.concat([]);
            var index = getArrayIndex(action.payload.id, artworks);
            if (index === -1) {
                artworks.push(action.payload);
                return Object.assign({}, state, {
                    'status': 'updated',
                    'artworks': [...artworks],
                });
            }
            else {
                artworks[index] = action.payload;
                return Object.assign({}, state, {
                    'status': 'updated',
                    'statusText': 'Your project artwork has been updated successfully!',
                    'artworks': [...artworks],
                });
            }
        case ARTWORK_GET_REQUEST:
            return Object.assign({}, state, {
                'status': 'getting',
            });
        case ARTWORK_GET_SUCCESS:
            return Object.assign({}, state, {
                'status': 'got',
                'artworks': action.payload
            });
        case ARTWORK_DELETE_REQUEST:
            return Object.assign({}, state, {
                'status': 'deleting',
            });
        case ARTWORK_DELETE_SUCCESS:
            var index = getArrayIndex(action.payload.id, state.artworks);
            if (index === -1)
                return Object.assign({}, state, {
                    'status': 'deleted',
                    'artworks': [...state.artworks]
                });
            return Object.assign({}, state, {
                'status': 'deleted',
                'artworks': [...state.artworks.slice(0, index), ...state.artworks.slice(index + 1)]
            });
        case ARTWORK_SET_SUCCESS:
            const setting = Object.assign({}, state.setting, action.payload);
            return Object.assign({}, state, {
                'setting': setting
            });
        case ARTWORK_TEMPLATE_GET_REQUEST:
            return Object.assign({}, state, {
                'status': 'gettingTempaltes',
            });
        case ARTWORK_TEMPLATE_GET_SUCCESS:
            return Object.assign({}, state, {
                'status': 'gotTempaltes',
                'templates': action.payload
            });

        default:
            return Object.assign({}, state);
    }
}

module.exports = {
    artwork,
};
