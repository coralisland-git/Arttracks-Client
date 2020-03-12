import React from 'react';
import cookie from 'react-cookie';
import actions from '../../redux/actions';
import {
    Button,
    Progress,
} from '@sketchpixy/rubix';

export default class TrackUploading extends React.Component {
  removeUploading (id) {
    const { projectId, file, dispatch } = this.props;

    if(file.dropZone) {
      let removeUploadings = [];
      const removeString = cookie.load('project_' + projectId + '_removed_uploadings');
      if(removeString)
        removeUploadings = removeString.toString().split(',');
      const index = removeUploadings.indexOf(id);
      if(index === -1)
          removeUploadings.push(id);
      cookie.save('project_' + projectId + '_removed_uploadings', removeUploadings.join(','), { path: '/' });
    }
    dispatch(actions.removeUploading(projectId, id));
  }

  cancelUploading () {
    const { file, rowIndex } = this.props;

    if(confirm("You are currently uploading. If you choose \"OK\", " +
            "the window will close and your upload will not finish. " +
            "Do you want to stop uploading and close the window?")) {
      this.removeUploading(file.id);
    }
  }

  render() {
    const { file, rowIndex } = this.props;
    return (
      <tr>
        <td>&nbsp;</td>
        <td className="text-center"><span className="rubix-icon icon-fontello-play-1"></span></td>
        <td className="text-center">{rowIndex + 1}</td>
        <td>{file.filename? file.filename: '---- ----'}</td>
        <td>----</td>
        <td className="text-center">--</td>
        <td className="text-right" width="25%">
          { file.progress < 100 ? 
              <Button bsStyle="link" className="pl1-imp pr1-imp pull-right" onClick={::this.cancelUploading}>
                <span className="rubix-icon icon-ikons-close"></span>
              </Button>
            : null 
          }
          <Progress striped active value={file.progress} min={0} max={100} id={`element_${file.id}`} className="track-progress"/>
        </td>
      </tr>
    );
  }
}
