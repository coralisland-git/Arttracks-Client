/**
 * Created by jarosanger on 10/14/16.
 */
import cookie from 'react-cookie';
import { ARTWORK_FAILURE, ARTWORK_RESET_SETTING, ARTWORK_SET_SUCCESS, 
    ARTWORK_CREATE_REQUEST, ARTWORK_CREATE_SUCCESS, ARTWORK_UPDATE_REQUEST, ARTWORK_UPDATE_SUCCESS,
    ARTWORK_DELETE_REQUEST, ARTWORK_DELETE_SUCCESS, ARTWORK_GET_REQUEST, ARTWORK_GET_SUCCESS,
    ARTWORK_TEMPLATE_GET_REQUEST, ARTWORK_TEMPLATE_GET_SUCCESS, PROJECT_SET_THUMBNAIL } from '../../constants';
import { sendRequest } from '../../services/requests';

function failArtwork(errorText) {
    return {
        type: ARTWORK_FAILURE,
        payload: {
            statusText: errorText
        }
    }
}

function artworkCreateSuccess(data) {
    return {
        type: ARTWORK_CREATE_SUCCESS,
        payload: data
    }
}

function artworkSaveSuccess(data) {
    return {
        type: ARTWORK_UPDATE_SUCCESS,
        payload: data
    }
}

function artworkGetSuccess(data) {
    return {
        type: ARTWORK_GET_SUCCESS,
        payload: data
    }
}

function artworkDeleteSuccess(artworkId) {
    return {
        type: ARTWORK_DELETE_SUCCESS,
        payload: {
            id: artworkId
        }
    }
}

function artworkTemplateGetSuccess(data) {
    return {
        type: ARTWORK_TEMPLATE_GET_SUCCESS,
        payload: data
    }
}

function resetArtworkSetting() {
    return dispatch => {
        dispatch({
            type: ARTWORK_RESET_SETTING
        });
    }
}

function setArtShape(shape) {
    return dispatch => {
        dispatch({
            type: ARTWORK_SET_SUCCESS,
            payload: { shape: shape }
        });
    }
}

function setArtLayout(template) {
    return dispatch => {
        dispatch({
            type: ARTWORK_SET_SUCCESS,
            payload: { template: template }
        });
    }
}

function setProjectThumbnail(thumbnail) {
    return dispatch => {
        dispatch({
            type: PROJECT_SET_THUMBNAIL,
            payload: { thumbnail: thumbnail }
        });
    }
}

function createArtwork(projectId, settings, file) {
    const userId = cookie.load('userId');
    const files = [];

    // Assign required template position "main_artwork" to file object
    // In the case of multiple files being uploaded, only apply to the first
    file.tpl_position = "main_artwork";

    let successAfter = null;

    if(file) {
        files.push(file);
        successAfter = () => setProjectThumbnail(file.url);
    }

    const metadata = [{
        "canvas":[{
            "settings": {
                "shape": settings.shape,
                "template_id": settings.template
            },
            "assets": files
        }]
    }];

    return sendRequest({
        method: 'POST',
        url: 'projects/' + projectId + '/artwork/',
        data: {
            project: projectId,
            user: userId,
            template: settings.template,
            thumbnail: file? file.url: "",
            metadata: JSON.stringify(metadata)
        },
        before: {type: ARTWORK_CREATE_REQUEST},
        success: function(response) {
            return artworkCreateSuccess(response.data);
        },
        // successAfter: successAfter,
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return failArtwork(errorData.details);
            }
            else {
                return failArtwork("It has been failed to create artwork.");
            }
        }
    });
}

function updateArtwork(artwork) {
    const userId = cookie.load('userId');

    return sendRequest({
        method: 'PUT',
        url: 'projects/' + artwork.project + '/artwork/' + artwork.id + '/',
        data: {
            project: artwork.project,
            user: userId,
            metadata: artwork.metadata,
        },
        before: {type: ARTWORK_UPDATE_REQUEST},
        success: function(response) {
            return artworkSaveSuccess(response.data);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return failArtwork(errorData.details);
            }
            else {
                return failArtwork("It has been failed to update artwork.");
            }
        }
    });
}

function getArtworks(projectId) {
    return sendRequest({
        method: 'GET',
        url: 'projects/' + projectId + '/artwork/',
        before: { type: ARTWORK_GET_REQUEST },
        success: function(response) {
            return artworkGetSuccess(response.data);
        },
        fail: function(errorData) {
            return failArtwork("Artwork not found.");
        }
    });
}

function removeArtwork(projectId, artworkId) {
    return sendRequest({
        method: 'DELETE',
        url: 'projects/' + projectId + '/artwork/' + artworkId + '/',
        before: { type: ARTWORK_DELETE_REQUEST },
        success: function(response) {
            return artworkDeleteSuccess(artworkId);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return failArtwork(errorData.details);
            }
            else {
                return failArtwork("It has been failed to remove artwork.");
            }
        }
    });
}

function getArtworkTemplates() {
    return sendRequest({
        method: 'GET',
        url: 'artwork_templates/',
        before: { type: ARTWORK_TEMPLATE_GET_REQUEST },
        success: function(response) {
            return artworkTemplateGetSuccess(response.data);
        },
        fail: function(errorData) {
            return failArtwork("Artwork not found.");
        }
    });
}

module.exports = {
    failArtwork,
    resetArtworkSetting,
    setArtShape,
    setArtLayout,
    createArtwork,
    updateArtwork,
    getArtworks,
    removeArtwork,
    getArtworkTemplates,
};
