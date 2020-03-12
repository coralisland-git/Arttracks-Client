import React from 'react';

export default (props) => {
  const { primary } = props;
  const fill = primary? '#FFFFFF': '#0BBCEF';
  const styles = {backgroundColor: fill};

  return (
    <div id="btn-loader">
      <span className="dot" style={styles}></span>
      <span className="dot" style={styles}></span>
      <span className="dot" style={styles}></span>
    </div>
  );
}
