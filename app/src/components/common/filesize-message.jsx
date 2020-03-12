import React from 'react';

class FileSizeMessage extends React.Component {

  bytesToSize(bytes) {
     var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
     if (bytes == 0) return '0 Byte';
     var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
     return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  render() {
    const { message, bytes } = this.props;
    const friendly_filesize = this.bytesToSize(bytes);

    return (
      <div>
        <span className="friendly-filesize">
          {message} { friendly_filesize }.
        </span>
      </div>
    );
  }
}

export default FileSizeMessage;
