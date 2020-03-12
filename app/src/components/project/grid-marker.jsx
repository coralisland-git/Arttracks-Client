import React from 'react';
import cx from 'classnames';

const Cell = (({l, t, selected, click}) => (
  <div style={{left: l * 40, top: t * 30}} 
    className={cx({'selected': selected && selected.left == l && selected.top == t})}
    onClick={() => click(l, t)} />
));

export default class GridMarker extends React.Component {
  handleClick(l, t) {
    this.props.select(l, t);
  }

  render() {
    let cells = [];

    for(let l=0; l<3; l++) {
      for(let t=0; t<3; t++) {
        cells.push(
          <Cell l={l} t={t} key={l * 3 + t}
            selected={this.props.selected}
            click={(l, t) => this.handleClick(l, t)} />
        );
      }
    }

    return (
      <div className='grid-marker'>{cells}</div>
    );
  }
}
