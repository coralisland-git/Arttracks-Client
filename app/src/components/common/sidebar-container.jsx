import React from 'react';
import ReactDOM from 'react-dom';
import { Link, withRouter} from 'react-router';
import { matchPattern } from 'react-router/lib/PatternUtils';
import classNames from 'classnames';
import { Motion, spring } from 'react-motion';
import { Icon, Dispatcher, Nav, NavItem } from '@sketchpixy/rubix';
import isBrowser from '../../utils/isBrowser';
import isTouchDevice from '../../utils/isTouchDevice';

const SvgIcon = ({icon}) => (<span className="svg-icon">{icon}</span>);

var routesStore = {};

function enableStateForPathname(pathname, params) {
  for (var pattern in routesStore) {
    var matchedRoute = matchRoutes([pattern], pathname, params);

    if (matchedRoute == pattern) {
      routesStore[pattern] = true;
    } else {
      routesStore[pattern] = false;
    }
  }
}

function matchRoute(pattern, pathname, params) {
  var remainingPathname = pathname;
  var paramNames = [], paramValues = [];

  if (remainingPathname !== null && pattern) {
    const matched = matchPattern(pattern, remainingPathname)

    if (!matched || !matched.paramNames || !matched.paramValues) {
      return false;
    }
    remainingPathname = matched.remainingPathname
    paramNames = [ ...paramNames, ...matched.paramNames ]
    paramValues = [ ...paramValues, ...matched.paramValues ]

    if (remainingPathname === '') {
      // We have an exact match on the route. Just check that all the params
      // match.
      // FIXME: This doesn't work on repeated params.
      return(paramNames.every((paramName, index) => (
        (String(paramValues[index]) === String(params[paramName]))
      )));
    }
  }

  return false;
}

function matchRoutes(routes, pathname, params) {
  var matched = false, patternMatched = '';
  for(var i = 0; i < routes.length; i++) {
    if (matchRoute(routes[i], pathname, params)) {
      if (matched == true) {
        if (matchRoute(patternMatched, routes[i], params)) {
          patternMatched = routes[i];
        }
      } else {
        matched = true;
        patternMatched = routes[i];
      }
    }
  }

  if (matched) {
    return patternMatched;
  } else {
    return false;
  }
}

function getOpenState() {
  return (!isTouchDevice()) ? (localStorage.getItem('sidebar-open-state') === 'true' ? true : false) : false;
}

const SidebarContainer = React.createClass({
  displayName: 'SidebarContainer',
  getInitialState() {
    return {
      open: true
    };
  },
  isOpen() {
    return this.state.open === open;
  },
  sidebarStateChangeCallback(open) {
    var openState = getOpenState();
    if(this.isOpen()) return;
    if(open !== undefined) {
      openState = open;
    } else {
      openState = !this.state.open;
    }
    this.setState({
      open: openState // toggle sidebar
    });
    localStorage.setItem('sidebar-open-state', openState);
  },
  enablePath(props) {
    if (props) {
      enableStateForPathname(props.location.pathname, props.params);
    }
    Dispatcher.publish('sidebar:activate');
  },
  componentWillReceiveProps(nextProps) {
    setTimeout(() => {
      this.enablePath(nextProps);
    }, 50);
    // this.enablePath();
  },
  componentWillUnmount() {
    Dispatcher.unsubscribe(this.handler);
  },
  startSwipe(e) {
    if (e.changedTouches.length) {
      var touches = e.changedTouches[0];
      this.startX = touches.pageX;
    }
  },
  swiping(e) {
    if (e.changedTouches.length) {
      var touches = e.changedTouches[0];
      var change = Math.abs(touches.pageX - this.startX);
      var hasSwiped = change > 25;

      var body = document.getElementById('body');
      var sidebar = document.getElementById('sidebar');
      var header = document.getElementById('rubix-nav-header');
      if (hasSwiped) {
        if (!this.state.open) {
          if (change > 250) return;
          body.style.marginLeft = change + 'px';
          body.style.marginRight = -change + 'px';
          sidebar.style.left = (-250 + change) + 'px';
          header.style.marginLeft = change + 'px';
          header.style.marginRight = -change + 'px';
        } else {
          if ((250 - change) < 0) return;
          body.style.marginLeft = (250 - change) + 'px';
          body.style.marginRight = -(250 - change) + 'px';
          sidebar.style.left = 0 - (250 - change) + 'px';
          header.style.marginLeft = (250 - change) + 'px';
          header.style.marginRight = -(250 - change) + 'px';
        }
      }
    }
  },
  cancelSwipe(e) {
    this.startX = 0;
    var body = document.getElementById('body');
    var sidebar = document.getElementById('sidebar');
    var header = document.getElementById('rubix-nav-header');
    body.style.marginLeft = '';
    body.style.marginRight = '';
    sidebar.style.left = '';
    header.style.marginLeft = '';
    header.style.marginRight = '';
    this.setState({
      open: false
    });
  },
  endSwipe(e) {
    if (e.changedTouches.length) {
      var touches = e.changedTouches[0];
      var change = (touches.pageX - this.startX);
      var hasSwiped = Math.abs(change) > 25;

      var body = document.getElementById('body');
      var sidebar = document.getElementById('sidebar');
      var header = document.getElementById('rubix-nav-header');

      if (hasSwiped) {
        body.style.marginLeft = '';
        body.style.marginRight = '';
        sidebar.style.left = '';
        header.style.marginLeft = '';
        header.style.marginRight = '';

        if (!this.state.open) {
          this.setState({
            open: true
          });
        } else {
          this.setState({
            open: false
          });
        }
      }
    }
  },
  componentDidMount() {
    this.handler = Dispatcher.subscribe('sidebar', this.sidebarStateChangeCallback);

    var openState = getOpenState();
    this.setState({
      open: openState
    });

    this.enablePath();
  },
  render() {
    var classes = classNames({
      'container-open': this.state.open
    });

    return (
      <div id='container' className={classes}>
        {this.props.children}
      </div>
    );
  }
});

export default SidebarContainer;

export class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.timer = null;

    this.state = {
      left: ((props.sidebar * 100) + '%'),
      visibility: (props.sidebar === 0) ? 'visible' : 'hidden'
    };

    this.reinitializeScrollbarHandler = null;
    this.destroyScrollbarHandler = null;
    this.repositionHandler = null;
    this.keychangeHandler = null;
    this.updateHandler = null;
  }

  repositionScrollbar(child_node, top, height) {
    var node = ReactDOM.findDOMNode(this.refs.sidebar);
    var scrollTo = top - node.getBoundingClientRect().top + node.scrollTop;

    while (child_node.parentNode) {
      if (child_node.parentNode === node) {
        if(scrollTo > (window.innerHeight / 2)) {
          node.scrollTop = (scrollTo - (window.innerHeight / 2) + 100);
        }
        break;
      }

      child_node = child_node.parentNode;
    }

    if(!isTouchDevice()) {
      this.updateScrollbar();
    }
  }

  updateScrollbar() {
    if(!isTouchDevice()) {
      if (isBrowser()) {
        if (window.Ps) {
          Ps.update(ReactDOM.findDOMNode(this.refs.sidebar));
        }
      }
    }
  }

  initializeScrollbar() {
    if (isBrowser() && !isTouchDevice()) {
      if (window.Ps) {
        Ps.initialize(ReactDOM.findDOMNode(this.refs.sidebar), {
          suppressScrollX: true
        });
      }
    }
  }

  destroyScrollbar() {
    if (isBrowser() && !isTouchDevice()) {
      if (window.Ps) {
        Ps.destroy(ReactDOM.findDOMNode(this.refs.sidebar));
      }
    }
  }

  handleKeyChange(sidebar) {
    var newLeft = ((this.props.sidebar*100) - (sidebar*100))+'%';
    this.setState({
      left: newLeft,
      visibility: 'visible'
    });
  }

  componentWillUnmount() {
    Dispatcher.unsubscribe(this.reinitializeScrollbarHandler);
    Dispatcher.unsubscribe(this.destroyScrollbarHandler);
    Dispatcher.unsubscribe(this.repositionHandler);
    Dispatcher.unsubscribe(this.keychangeHandler);
    Dispatcher.unsubscribe(this.updateHandler);
  }

  componentDidMount() {
    this.initializeScrollbar();

    this.reinitializeScrollbarHandler = Dispatcher.subscribe('sidebar:reinitialize', ::this.initializeScrollbar);
    this.destroyScrollbarHandler = Dispatcher.subscribe('sidebar:destroy', ::this.destroyScrollbar)
    this.repositionHandler = Dispatcher.subscribe('sidebar:reposition', ::this.repositionScrollbar);
    this.keychangeHandler = Dispatcher.subscribe('sidebar:keychange', ::this.handleKeyChange);
    this.updateHandler = Dispatcher.subscribe('sidebar:update', ::this.updateScrollbar);

    if (this.props.active) {
      Dispatcher.publish('sidebar:controlbtn', this.props);
      Dispatcher.publish('sidebar:keychange', this.props.sidebar);
    }
  }

  render() {
    var props = {
      style: {
        left: this.state.left,
        visibility: this.state.visibility,
        transition: 'all 0.3s ease',
        OTransition: 'all 0.3s ease',
        MsTransition: 'all 0.3s ease',
        MozTransition: 'all 0.3s ease',
        WebkitTransition: 'all 0.3s ease'
      },
      // ...this.props,
      className: classNames('sidebar',
                            'sidebar__main',
                            this.props.className)
    };

    return (
      <div ref='sidebar' {...props} children={null} data-id={this.props.sidebar}>
        <div ref='innersidebar'>{this.props.children}</div>
      </div>
    );
  }
}

export class SidebarNav extends React.Component {
  static id = 0;

  constructor(props) {
    super(props);

    this.id = ++SidebarNav.id;
  }

  getID() {
    return this.id;
  }

  getHeight() {
    return ReactDOM.findDOMNode(this.refs.ul).getClientRects()[0].height;
  }

  search(text) {
    Dispatcher.publish('sidebar:search', text, this.getID());
  }

  render() {
    var classes = classNames('sidebar-nav',
                              this.props.className);

    if (this.props.sidebarNavItem) {
      this.props.sidebarNavItem.childSidebarNav = this;
    }

    var props = {
      // ...this.props,
      className: classes
    };

    var children = React.Children.map(this.props.children, (el) => {
      return React.cloneElement(el, {
        SidebarNavID: this.props.SidebarNavID || this.getID(),
        sidebarNavItem: this.props.sidebarNavItem,
        rootSidebarNavItem: this.props.rootSidebarNavItem
      });
    });

    return (
      <ul ref='ul' {...props} children={null}>
        {children}
      </ul>
    );
  }
}

@withRouter
export class SidebarNavItemSvg extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: props.open || false,
      active: props.active || false,
      toggleOpen: props.open || false,
      dir: 'left',
      opposite: false,
      height: 53,
      svgIcon: props.svgIcon || false,
      hover: false,
      external: props.external || false,
    };

    this.routes = [];

    this.activateHandler = null;
    this.searchHandler = null;
    this.closeHandler = null;
  }

  handleLayoutDirChange(dir) {
    this.setState({
      dir: dir === 'ltr' ? 'left' : 'right',
      opposite: dir === 'ltr' ? false : true
    });
  }

  getTotalHeight() {
    if (this.childSidebarNav) {
      return this.childSidebarNav.getHeight() + 53;
    } else {
      return 53;
    }
  }

  openSidebarNav(fullOpen, height, isClosing) {
    if (this.state.open && !height) return;

    height = height || 0;
    var thisHeight = this.getTotalHeight();
    var totalHeight = height + thisHeight;

    if (this.childSidebarNav) {
      this.setState({
        height: totalHeight,
        open: true,
        toggleOpen: true,
      }, () => {
        Dispatcher.publish('sidebar:update');
        if (this.props.sidebarNavItem) {
          if (isClosing) {
            this.props.sidebarNavItem.openSidebarNav(false, 53 - totalHeight, true);
          } else {
            if (fullOpen) {
              this.props.sidebarNavItem.openSidebarNav(true, totalHeight - 53);
            } else {
              this.props.sidebarNavItem.openSidebarNav(false, thisHeight - 53);
            }
          }
        }
      });
    }
  }

  closeSidebarNav(collapseRoot) {
    if (!this.state.open) return;

    var thisHeight = this.getTotalHeight();
    if (this.childSidebarNav) {
      this.setState({
        height: 53,
        open: false,
        toggleOpen: false,
      }, () => {
        Dispatcher.publish('sidebar:update');
        if (this.props.sidebarNavItem) {
          this.props.sidebarNavItem.openSidebarNav(false, 53 - thisHeight, true);
        }
      });
    }
  }

  toggleSidebarNav() {
    if (this.state.height === 53) {
      this.openSidebarNav();
    } else {
      this.closeSidebarNav();
    }
  }

  getTopmostLi(node, li, original_node) {
    if (!original_node) original_node = node;
    while (node.parentNode) {
      if (node.parentNode.className.search('sidebar-nav-container') !== -1) {
        if (li) {
          return li;
        } else {
          return original_node;
        }
      }

      if (node.parentNode.nodeName.toLowerCase() === 'li') {
        li = node.parentNode;
      }
      node = node.parentNode;
    }
  }

  getSiblingsLi(node) {
    var original_node = node;
    var sibilings = [];
    while (node.nextSibling) {
      sibilings.push(node.nextSibling);
      node = node.nextSibling;
    }
    node = original_node;
    while (node.previousSibling) {
      sibilings.push(node.previousSibling);
      node = node.previousSibling;
    }

    return sibilings;
  }

  getSiblingsNav(node) {
    var original_node = node;
    var siblings = [];
    while (node.nextSibling) {
      if (node.nextSibling.className.search('sidebar-nav') !== -1) {
        siblings.push(node.nextSibling);
      }
      node = node.nextSibling;
    }
    node = original_node;
    while (node.previousSibling) {
      if (node.previousSibling.className.search('sidebar-nav') !== -1) {
        siblings.push(node.previousSibling);
      }
      node = node.previousSibling;
    }

    return siblings;
  }

  getTopmostSidebar(node) {
    while (node.parentNode) {
      if (node.parentNode.className.search('sidebar__main') !== -1) {
        return node.parentNode;
      }
      node = node.parentNode;
    }
  }

  checkAndClose(props) {
    var node = ReactDOM.findDOMNode(this._node);

    var topmostLi = this.getTopmostLi(node);
    var topmostSiblingLis = this.getSiblingsLi(topmostLi);
    var siblingLis = this.getSiblingsLi(node);
    var topmostSidebar = this.getTopmostSidebar(node);
    var id = parseInt(topmostSidebar.getAttribute('data-id')) || 0;

    Dispatcher.publish('sidebar:controlbtn', {sidebar: id});
    Dispatcher.publish('sidebar:keychange', id);

    for (var i = siblingLis.length - 1; i >= 0; i--) {
      var li = siblingLis[i];
      if (li && typeof li.close === 'function') li.close();
    };

    for (var i = 0; i < topmostSiblingLis.length; i++) {
      var li = topmostSiblingLis[i];
      if (li && typeof li.close === 'function') li.close();
    }

    try {
      var height = node.getClientRects()[0].height;
      var top = node.getClientRects()[0].top;
      setTimeout(() => {
        Dispatcher.publish('sidebar:reposition', node, top, height);
      }, 300);
    } catch(e) {

    }
  }

  handleSearch(text, id) {
    var links = this._node.getElementsByTagName('a');
    var link = links[0];

    if (id === this.props.SidebarNavID) {
      if (!this.props.hidden && links.length === 1) {
        if (link.innerText.toLowerCase().search(text.toLowerCase()) === -1) {
          this._node.style.display = 'none';
        } else {
          this._node.style.display = 'block';
        }
      } else if (links.length > 1) {
        if (this._node.innerText.toLowerCase().search(text.toLowerCase()) === -1) {
          this._node.style.display = 'none';
        } else {
          this._node.style.display = 'block';
        }
      }
    }
  }

  closeNav() {
    this.closeSidebarNav();
  }

  handleClick = (e) => {
    if (!this.props.href) {
      e.preventDefault();
      e.stopPropagation();
      this.toggleSidebarNav();
    }
    if (this.props.hasOwnProperty('onClick')) {
      this.props.onClick();
    }

    this.closeNav();
  };

  activateSidebar() {
    var found = false, route;
    for (var i = 0; i < this.routes.length; i++) {
      var r = this.routes[i];
      if (routesStore[r]) {
        route = r;
        found = true;
        break;
      }
    }
    if (found) {
      this.setState({
        active: true
      });

      this.checkAndClose(this.props);

      if (this.props.sidebarNavItem) {
        this.props.sidebarNavItem.openSidebarNav(true);
      }

      if (this.props.rootSidebarNavItem) {
        this.props.rootSidebarNavItem.openSidebarNav();
      }
    } else {
      this.setState({
        active: false
      });
    }
  }

  closeSidebarRoot() {
    if (!this.props.sidebarNavItem) {
      this.closeSidebarNav();
    }
  }

  hover(isOver) {
    this.setState({hover: isOver});
  }

  componentWillUnmount() {
    Dispatcher.unsubscribe(this.activateHandler);
    Dispatcher.unsubscribe(this.closeHandler);
    Dispatcher.unsubscribe(this.searchHandler);
  }

  componentDidMount() {
    this.activateHandler = Dispatcher.subscribe('sidebar:activate', ::this.activateSidebar);
    this.closeHandler = Dispatcher.subscribe('sidebar:close', ::this.closeSidebarRoot);
    this.searchHandler = Dispatcher.subscribe('sidebar:search', ::this.handleSearch);

    if (this.props.hasOwnProperty('href') && this.props.href.length && this.props.href !== '#') {
      routesStore[this.props.href] = this.state.active;

      this.routes.push(this.props.href);

      if (this.props.aliases) {
        for (var i = 0; i < this.props.aliases.length; i++) {
          var alias = this.props.aliases[i];
          this.routes.push(alias);
          routesStore[alias] = this.state.active;
        }
      }
    }

    var node = ReactDOM.findDOMNode(this._node);
    node.close = ::this.closeNav;

    enableStateForPathname(
      this.props.router.location.pathname,
      this.props.router.params
    );
  }

  render() {
    var classes = classNames({
      'open': this.state.open,
      'active': this.state.active,
      'sidebar-nav-item': true,
      'has-svg': this.state.svgIcon,
      'external': this.state.external,
    });
    var toggleClasses = classNames({
      'toggle-button': true,
      'open': this.state.toggleOpen,
      'opposite': this.state.opposite
    });
    var icon=null, toggleButton = null;
    if(this.props.children) {
      toggleButton = <Icon className={toggleClasses.trim()} bundle='fontello' glyph={this.state.dir+'-open-3'} />;
    }
    if(this.props.glyph || this.props.bundle) {
      icon = <Icon bundle={this.props.bundle} glyph={this.props.glyph} />;
    }
    else if(this.props.svgIcon) {
      if(this.props.hoverIcon && (this.state.active || this.state.hover)) {
        icon = <SvgIcon icon={this.props.hoverIcon} />;
      }
      else {
        icon = <SvgIcon icon={this.props.svgIcon} />;
      }
    }
    var style = {height: this.props.autoHeight ? 'auto' : this.state.height};

    var props = {
      name: null,
      style: style,
      tabIndex: '-1',
      // ...this.props,
      className: classes.trim()
    };

    var RouteLink = 'a';
    var componentProps = {
      name: null,
      tabIndex: -1,
      href: this.props.href || '',
      onClick: this.handleClick,
      style: {height: 53}
    };

    var pointerEvents = 'all';
    if(this.props.hasOwnProperty('href') && this.props.href.length && this.props.href !== '#') {
      RouteLink = Link;
      componentProps.to = this.props.href;
      delete componentProps.href;

      if(this.props.href.search(":") !== -1) {
        pointerEvents = 'none';
      }
    }
    else if(this.props.external && this.props.external !== '') {
      componentProps.href = this.props.external;
      componentProps.target = '_blank';
      delete componentProps.onClick;
    }

    var isRoot = this.props.sidebarNavItem ? false : true;

    var children = React.Children.map(this.props.children, (el) => {
      return React.cloneElement(el, {
        sidebarNavItem: this,
        SidebarNavID: this.props.SidebarNavID,
        rootSidebarNavItem: isRoot ? this : this.props.rootSidebarNavItem
      });
    });

    return (
      <Motion style={{height: spring(this.state.height, {stiffness: 300, damping: 20, precision: 0.0001})}}>
        {(style) =>
          <li ref={(c) => this._node = c}
            {...props}
            style={{display: this.props.hidden ? 'none': 'block', pointerEvents: pointerEvents, ...style}}
            onMouseEnter={(e) => this.hover(true)}
            onMouseLeave={(e) => this.hover(false)}
          >
            <RouteLink {...componentProps}>
              {icon}
              <span className='name'>{this.props.name}</span>
              {toggleButton}
            </RouteLink>
            {children}
          </li>
        }
      </Motion>
    );
  }
}

export class SidebarControls extends React.Component {
  render() {
    var classes = classNames('sidebar-controls-container',
                              this.props.className);
    var props = {
      dir: 'ltr',
      // ...this.props,
      className: classes
    };

    return (
      <div {...props} children={null}>
        <ul className='sidebar-controls' tabIndex='-1'>
          {this.props.children}
        </ul>
      </div>
    );
  }
}

export class SidebarControlBtn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: props.active || false
    };

    this.controlbtnHandler = null;
  }

  handleClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    Dispatcher.publish('sidebar:controlbtn', this.props);
    Dispatcher.publish('sidebar:keychange', this.props.sidebar);
  };

  handleState(props) {
    if(props.hasOwnProperty('sidebar')) {
      if(props.sidebar === this.props.sidebar) {
        this.setState({active: true});
      } else {
        this.setState({active: false});
      }
    }
  }

  componentWillUnmount() {
    Dispatcher.unsubscribe(this.controlbtnHandler);
  }

  componentDidMount() {
    this.controlbtnHandler = Dispatcher.subscribe('sidebar:controlbtn', ::this.handleState);
  }

  render() {
    var classes = classNames('sidebar-control-btn', {
      'active': this.state.active
    }, this.props.className);

    var props = {
      tabIndex: '-1',
      onClick: this.handleClick,
      // ...this.props,
      className: classes.trim()
    };
    return (
      <li {...props}>
        <a href='#' tabIndex='-1'>
          <Icon bundle={this.props.bundle} glyph={this.props.glyph}/>
        </a>
      </li>
    );
  }
}

export class SidebarBtn extends React.Component {
  handleSidebarStateChange = () => {
    Dispatcher.publish('sidebar');
  };

  render() {
    var classes = classNames('pull-left visible-xs-inline-block',
                             this.props.className);
    var props = {
      // ...this.props,
      // classes,
      pullLeft: true,
      className: this.props.className,
    };

    return (
      <Nav {...props} onSelect={this.handleSidebarStateChange}>
        <NavItem data-id='sidebar-btn' className='sidebar-btn' href='/'>
          <Icon bundle='fontello' glyph='th-list-5' />
        </NavItem>
      </Nav>
    );
  }
}

export class SidebarDivider extends React.Component {
  static propTypes = {
    color: React.PropTypes.string,
  };

  static defaultProps = {
    color: '#3B4648',
  };

  render() {
    return (
      <hr style={{
        borderColor: this.props.color,
        borderWidth: 2,
        marginTop: 15,
        marginBottom: 0,
        width: 200}} />
    );
  }
}
