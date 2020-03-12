import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Toggle from 'react-toggle';
import Slider from 'rc-slider';
import { Row, Col, Alert, Form, FormGroup, FormControl, Button, ControlLabel } from '@sketchpixy/rubix';
import { FILEPICKER_KEY } from '../../constants';
import actions from '../../redux/actions';
import { getObjectValue } from '../../utils';
import { IconEQSpectrumSvg, IconEQBounceSvg, IconEQNormalSvg } from '../common/svg-icon.jsx';
import * as PlanCheck from '../../services/plan-check';
import ProjectHeader from './project-header.jsx';
import ProjectAlert from './project-alert.jsx';
import ButtonLoader from '../common/button-loader.jsx';
import GridMarker from './grid-marker.jsx';

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 360;
const DEFAULT_SHAPE = "horizontal";

class ProjectSettings extends React.Component {
  fabric;
  canvas;
  thumbnailUrl;
  thumbnailImage;
  watermarkUrl;
  watermarkImage;
  atmosImage;

  constructor(...args) {
    super(...args);

    const projectId = this.props.params.projectId ? this.props.params.projectId : null;
    const eqStyles = ['normal', 'spectrum', 'bounce'];
    const atmosTypes = ['snow'];
    const atmosImages = { 
      'snow':  '/imgs/overlays/snow.png'
    }

    this.state = {
      projectId: projectId,
      titleAnimation: true,
      textColor: "#000",
      backColor: "#fff",
      defaultBranding: false,
      customBranding: false,
      opacity: 100,
      eqElement: false,
      eqColor: "#fff",
      eqStyle: "normal",
      eqStyles: eqStyles,
      atmosElement: false,
      atmosType: "snow",
      atmosTypes: atmosTypes,
      atmosImages: atmosImages,
      watermarkCoords: null,
      watermarkPosition: {left: 2, top: 2},
      canvasWidth: DEFAULT_WIDTH,
      canvasHeight: DEFAULT_HEIGHT,
      canvasShape: DEFAULT_SHAPE
    };
  }

  componentWillMount() {
    const { dispatch, project, status } = this.props;

    if(this.state.projectId && (!project || this.state.projectId != project.id)) {
      dispatch(actions.getProject(this.state.projectId));
    }

    if(this.state.projectId && !status) {
      dispatch(actions.getArtworks(this.state.projectId));
    }

    if(project) {
      this.loadSettings(project);
    }
  }

  componentWillReceiveProps (nextProps) {
    const { project, status } = nextProps;
    
    if (project && (status != this.props.state && (status == "got" || status == "saved"))) {
      this.loadSettings(project);
    }
  }

  componentDidMount() {
    const filepicker = require('filepicker-js');
    const { fabric } = require('fabric');
    const { textColor, backColor, eqColor } = this.state;

    filepicker.setKey(FILEPICKER_KEY);

    const canvas = new fabric.Canvas('canvas');
    this.fabric = fabric;
    this.canvas = canvas;

    canvas.on('object:modified', this.onCanvasModified);

    canvas.on('object:moving', this.onCanvasElementMoved);

    this.renderCanvas();


    $("#text-colorpicker").spectrum({
      color: textColor,
      chooseText: "Choose",
      cancelText: "Cancel",
      hideAfterPaletteSelect: true,
      showInput: true,
      showInitial: true,
      showAlpha: true,
      showPalette: true,
      showSelectionPalette: true,
      preferredFormat: "rgb",
      change: (color) => {
        this.setState({ textColor: color.toRgbString()});
      },
    });

    $("#background-colorpicker").spectrum({
      color: backColor,
      chooseText: "Choose",
      cancelText: "Cancel",
      hideAfterPaletteSelect: true,
      showInput: true,
      showInitial: true,
      showAlpha: true,
      showPalette: true,
      showSelectionPalette: true,
      preferredFormat: "rgb",
      change: (color) => {
        this.setState({ backColor: color.toRgbString()});
      },
    });

    $("#eq-colorpicker").spectrum({
      color: eqColor,
      chooseText: "Choose",
      cancelText: "Cancel",
      hideAfterPaletteSelect: true,
      showInput: true,
      showInitial: true,
      showAlpha: true,
      showPalette: true,
      showSelectionPalette: true,
      preferredFormat: "rgb",
      change: (color) => {
        this.setState({ eqColor: color.toRgbString()});
      },
    });
  }

  componentDidUpdate(prevProps) {
    const { project, status, artworks } = prevProps;
    var { canvasWidth, canvasHeight, canvasShape } = this.state;

    var artwork, metadata, shape, newCanvasWidth, newCanvasHeight;

    if (artworks.length) {

      // Get artwork
      artwork = artworks[0]

      // Get artwork metadata
      metadata = JSON.parse(artwork.metadata)[0];
      
      // Get artwork shape
      shape = metadata.canvas[0].settings["shape"];
      
      if (shape) {

        if ( shape == "square" ) {
          console.log("Determined to be square");
          newCanvasWidth = 360;
          newCanvasHeight = 360;
        } else if (shape == "vertical") {
          console.log("Determined to be vertical");
          newCanvasWidth = 360;
          newCanvasHeight = 640;
        } else {
          newCanvasWidth = canvasWidth;
          newCanvasHeight = canvasHeight;
        }

        console.log("newCanvasWidth is " + newCanvasWidth + " and newCanvasHeight is " + newCanvasHeight);

        if (shape != canvasShape || newCanvasWidth != canvasWidth || newCanvasHeight != canvasHeight) {
          console.log("Setting state cuz some shit different");
          this.setState({ canvasShape: shape, canvasWidth: newCanvasWidth, canvasHeight: newCanvasHeight });
          console.log("Successfully set state");
        }
      }
    }

    this.renderCanvas();
    
  }

  loadSettings(project) {
    const settings = JSON.parse(project.settings);

    this.setState({ projectId: project.id });

    if (settings && settings.length) {
      let textColor = getObjectValue(settings[0], ["title_bar", "text_color"], "#000");
      let backColor = getObjectValue(settings[0], ["title_bar", "background_color"], "#fff");
      let eqColor = getObjectValue(settings[0], ["eq", "bar_color"], "#fff");

      this.setState({
        titleAnimation: getObjectValue(settings[0], ["title_bar", "display"], true),
        textColor: textColor,
        backColor: backColor,
        defaultBranding: getObjectValue(settings[0], ["watermark", "attribution"], true),
        customBranding: getObjectValue(settings[0], ["watermark", "custom"], false),
        eqElement: getObjectValue(settings[0], ["eq", "display"], false),
        eqColor: eqColor,
        eqStyle: getObjectValue(settings[0], ["eq", "style"], "normal"),
        atmosElement: getObjectValue(settings[0], ["atmospheric", "display"], false),
        atmosType: getObjectValue(settings[0], ["atmospheric", "type"], "snow"),
        opacity: getObjectValue(settings[0], ["watermark", "opacity"], 50),
      });

      $("#text-colorpicker").spectrum("set", textColor);
      $("#background-colorpicker").spectrum("set", backColor);
      $("#eq-colorpicker").spectrum("set", eqColor);

      const watermarkCoords = getObjectValue(settings[0], ["watermark", "coords"], null);
      const watermarkPosition = getObjectValue(settings[0], ["watermark", "grid"], null);

      if(watermarkPosition) {
        this.setState({watermarkPosition, watermarkCoords});
      }

    } else {
      this.setState({
        defaultBranding: true,
      });
    }
  }

  generateWatermarkSettings(watermark_url) {
    let { watermarkCoords, watermarkPosition } = this.state;
    let uploaded_watermark = new Image();
    uploaded_watermark.onload = () => {

      // Determine uploaded watermark's orientation,dimensions, and aspect ratio
      let orientation = "landscape";
      let aspectRatio = uploaded_watermark.width / uploaded_watermark.height;
      let width = uploaded_watermark.width;
      let height = uploaded_watermark.height;

      if(uploaded_watermark.width < uploaded_watermark.height) {
        orientation = "portrait";
      }

      if(orientation == "landscape") {
        width = 100;
        height = width / aspectRatio;
      } else {
        height = 100;
        width = height * aspectRatio;
      }

      // Set position to lower left corner
      watermarkPosition.top = 2;
      watermarkPosition.left = 2;

      let coords = {
        width: uploaded_watermark.width,
        height: uploaded_watermark.height,
        scaleX: width / uploaded_watermark.width,
        scaleY: height / uploaded_watermark.height,
      };
      this.setWatermarkCoords(coords, watermarkPosition);
    }
    uploaded_watermark.src = watermark_url;

    // TODO: Define settings to be saved
    let settings = [{
      "title_bar": {
        "display": this.state.titleAnimation,
        "text_color": this.state.textColor,
        "background_color": this.state.backColor,
      },
      "watermark": {
        "attribution": this.state.defaultBranding,
        "custom": this.state.customBranding,
        "opacity": this.state.opacity,
        "coords": this.state.watermarkCoords,
        "grid": this.state.watermarkPosition,
      },
      "eq": {
        "display": this.state.eqElement,
        "bar_color": this.state.eqColor,
        "style": this.state.eqStyle,
      },
      "atmospheric": {
        "display": this.state.atmosElement,
        "type": this.state.atmosType,
      }
    }];

    return settings;
  }

  uploadWatermark = (e) => {
    e.preventDefault();
    $(".alert", "#alert-box").remove();
    const { project, dispatch, userPlan, plans } = this.props;
    let maxSize = PlanCheck.getQuotaValueByCode(PlanCheck.getQuotas(userPlan, plans), 'image_upload_data');

    filepicker.pick({
      extensions: ['.png', '.jpg', '.jpeg'],
      container: 'modal',
      openTo: 'COMPUTER',
      maxSize: maxSize * 1024 * 1024,
    },
    (FPFile) => {
      if(!PlanCheck.checkMaxImageUploadSize(userPlan, plans, FPFile.size)) {
        dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "image_upload_data" }));
      }
      else {
        // Generate settins for uploaded watermark file
        let uploaded_watermark_settings = this.generateWatermarkSettings(FPFile.url);

        // Dispatch saveProjectSettings vs saveProjectWatermark
        let watermark = FPFile.url;
        dispatch(actions.saveProjectSettings(this.state.projectId, watermark, JSON.stringify(uploaded_watermark_settings)));

        //dispatch(actions.saveProjectWatermark(project.id, FPFile.url));
      }
    },
    (FPError) => {
      $("#alert-box").append("<div className='alert alert-danger'>Sorry, something went wrong. Please try again in a little bit.</div>");
    });
  }

  onDrop = (attachFiles) => {
    $(".alert", "#alert-box").remove();

    const { project, dispatch, userPlan, plans } = this.props;

    if(attachFiles.length == 0)
      return false;
    else if(!PlanCheck.checkMaxImageUploadSize(userPlan, plans, attachFiles[0].size)) {
      dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "image_upload_data" }));
      return false;
    }

    filepicker.store(
      attachFiles[0],
      (FPFile) => {
        // Generate settings for uploaded watermark file
        let uploaded_watermark_settings = this.generateWatermarkSettings(FPFile.url);

        // Dispatch saveProjectSettings vs saveProjectWatermark
        let watermark = FPFile.url;
        dispatch(actions.saveProjectSettings(this.state.projectId, watermark, JSON.stringify(uploaded_watermark_settings)));
        //dispatch(actions.saveProjectWatermark(project.id, FPFile.url));
      },
      (FPError) => {
        $("#alert-box").append("<div className='alert alert-danger'>Sorry, something went wrong. Please try again in a little bit.</div>");
      },
    );

    return false;
  }

  deleteWatermark = (e) => {
    e.preventDefault();
    const { project, dispatch } = this.props;
    const canvas = this.canvas;

    if(confirm("You are about to remove this watermark.")) {
      // Clear out coords and position settings values
      this.setState({ 
        watermarkCoords: null,
        watermarkPosition: {
          top: null,
          left: null,
        }, 
      });

      let settings = [{
        "title_bar": {
          "display": this.state.titleAnimation,
          "text_color": this.state.textColor,
          "background_color": this.state.backColor,
        },
        "watermark": {
          "attribution": this.state.defaultBranding,
          "custom": this.state.customBranding,
          "opacity": this.state.opacity,
          "coords": null,
          "grid": this.state.watermarkPosition,
        },
        "eq": {
          "display": this.state.eqElement,
          "bar_color": this.state.eqColor,
          "style": this.state.eqStyle,
        },
        "atmospheric": {
          "display": this.state.atmosElement,
          "type": this.state.atmosType,
        }
      }];

      let watermark = "";
      dispatch(actions.saveProjectSettings(this.state.projectId, watermark, JSON.stringify(settings)));

      // Make call to save watermark value as empty
      //dispatch(actions.saveProjectWatermark(project.id, ""));
      
      // Clear out set watermark image
      canvas.remove(this.watermarkImage);
    }
  }

  toggleTitleAnimation = (e) => {
    const titleAnimation = e.target.checked;
    this.setState({titleAnimation: titleAnimation});
  }

  toggleDefaultBranding = (e) => {
    const defaultBranding = e.target.checked;
    const { userPlan, plans, dispatch } = this.props;
    const { watermarkCoords } = this.state;

    if(!defaultBranding) {
      if(PlanCheck.checkUnbrandedVideos(userPlan, plans)) {
        this.setState({defaultBranding: false});
      }
      else {
        dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "unbranded_videos" }));
        this.setState({ defaultBranding: true, watermarkCoords: null });
      }
    }
    else {
      this.setState({ defaultBranding: true, customBranding: false, watermarkCoords: watermarkCoords });
    }
  }

  toggleCustomBranding = (e) => {
    const customBranding = e.target.checked;
    const { userPlan, plans, dispatch } = this.props;
    const { watermarkCoords } = this.state;

    if(customBranding) {
      if(PlanCheck.checkVideoBranding(userPlan, plans)) {
        this.setState({ customBranding: true, defaultBranding: false, watermarkCoords: watermarkCoords });
      }
      else {
        dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "video_branding" }));
        this.setState({customBranding: false});
      }
    }
    else {
      this.setState({ customBranding: false, defaultBranding: true, watermarkCoords: watermarkCoords });
    }
  }

  toggleEQElement = (e) => {
    const eqElement = e.target.checked;
    const { userPlan, plans, dispatch } = this.props;

    if(eqElement) {
      if(PlanCheck.checkAudioReactiveEffects(userPlan, plans)) {
        this.setState({eqElement: true});
      }
      else {
        dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "audio_reactive_efx" }));
        this.setState({eqElement: false});
      }
    }
    else {
      this.setState({eqElement: false});
    }
  }

  toggleAtmosElement = (e) => {
    const atmosElement = e.target.checked;
    const { userPlan, plans, dispatch } = this.props;

    if(atmosElement) {
      this.setState({atmosElement: true});
    }
    else {
      this.setState({atmosElement: false});
    }
  }

  changeEQStyle = () => {
    this.setState({ eqStyle: this.refs.eqStyleSelector.value});
  }

  changeAtmosType = () => {
    this.setState({ atmosStyle: this.refs.atmosTypeSelector.value});
  }

  handleOpacity = (opacity) => {
    this.setState({opacity: opacity});
  }

  saveSettings = () => {
    const { dispatch, project } = this.props;

    let settings = [{
      "title_bar": {
        "display": this.state.titleAnimation,
        "text_color": this.state.textColor,
        "background_color": this.state.backColor,
      },
      "watermark": {
        "attribution": this.state.defaultBranding,
        "custom": this.state.customBranding,
        "opacity": this.state.opacity,
        "coords": this.state.watermarkCoords,
        "grid": this.state.watermarkPosition,
      },
      "eq": {
        "display": this.state.eqElement,
        "bar_color": this.state.eqColor,
        "style": this.state.eqStyle,
      },
      "atmospheric": {
        "display": this.state.atmosElement,
        "type": this.state.atmosType,
      }
    }];

    let watermark = project && project.watermark? project.watermark: "";
    dispatch(actions.saveProjectSettings(this.state.projectId, watermark, JSON.stringify(settings)));
  }

  resetSettings = () => {
    this.setState({
      titleAnimation: true,
      textColor: "#000",
      backColor: "#fff",
      defaultBranding: true,
      customBranding: false,
      opacity: 100,
      eqElement: false,
      eqColor: "#fff",
      eqStyle: "normal"
    });
    $("#text-colorpicker").spectrum("set", "#000");
    $("#background-colorpicker").spectrum("set", "#fff");
    $("#eq-colorpicker").spectrum("set", "#fff");
  }

  percentFormatter = (v) => {
    return `${v} %`;
  }

  selectWatermarkPosition = (left, top) => {
    this.setWatermarkCoords(this.state.watermarkCoords, {left, top});
  }

  onCanvasElementMoved = ({target}) => {
    const { watermarkPosition, watermarkCoords } = this.state;

    // TODO: Detect element moved
    // This could probably be achieved by assigning an index to state for each element and 
    // referencing this here to check.

    let width = target.width * target.scaleX;
    let height = target.height * target.scaleY;
    let left = target.left;
    let top = target.top;
    let scaleX = width / target.width;
    let scaleY = height / target.height;
    this.watermarkImage.set({ scaleX, scaleY });

    if(watermarkPosition.top !== null && watermarkPosition.left != null) {
      this.setState({
        watermarkPosition: {
          top: null,
          left: null,
        },
      });
    }
    
    this.setState({
      watermarkCoords: {
        left,
        top,
        width: target.width,
        height: target.height,
        scaleX,
        scaleY,
      },
    });
  }

  onCanvasModified = ({target}) => {
    const { watermarkPosition, watermarkCoords, canvasWidth, canvasHeight } = this.state;

    let aspectRatio = target.width / target.height;
    let width = target.width * target.scaleX;
    let height = target.height * target.scaleY;
    let left = target.left;
    let top = target.top;
    
    if(width > canvasWidth - 20) {
      width = canvasWidth - 20;
    }

    height = width / aspectRatio;

    if(height > canvasHeight - 20) {
      height = canvasHeight - 20;
      width = height * aspectRatio;
    }

    if(left) {
      if(target.left < 15) {
        left = 15;
      }
      else if(target.left > canvasWidth - width - 15) {
        left = canvasWidth - width - 15;
      }
    }
    else {
      left = canvasWidth - width - 15;
    }
    
    if(top) {
      if(target.top < 15) {
        top = 15;
      }
      else if(target.top > canvasHeight - height - 15) {
        top = canvasHeight - height - 15;
      }
    }
    else {
      top = canvasHeight - height - 15;
    }
    
    let scaleX = width / target.width;
    let scaleY = height / target.height;
    this.watermarkImage.set({ scaleX, scaleY });
    
    this.setState({
      watermarkCoords: {
        left,
        top,
        width: target.width,
        height: target.height,
        scaleX,
        scaleY,
      },
    });
  }

  setWatermarkCoords(watermarkCoords, watermarkPosition) {
    const { canvasWidth, canvasHeight, customBranding } = this.state;

    let width = watermarkCoords.width * watermarkCoords.scaleX;
    let height = watermarkCoords.height * watermarkCoords.scaleY;
    let left = canvasWidth - width - 15;
    let top = canvasHeight - height - 15;

    if(customBranding) {
      if(watermarkPosition.left == 0) {
        left = 15;
      }
      else if(watermarkPosition.left == 1) {
        left = (canvasWidth - width) / 2;
      }
      
      if(watermarkPosition.top == 0) {
        top = 15;
      }
      else if(watermarkPosition.top == 1) {
        top = (canvasHeight - height) / 2;
      }
    }
    
    this.setState({ watermarkPosition, watermarkCoords: {...watermarkCoords, left, top} });
  }

  renderCanvas() {
    const { project, artworks } = this.props;
    let { defaultBranding, customBranding, opacity, watermarkCoords, watermarkPosition, canvasWidth, canvasHeight, canvasShape, atmosImages, atmosType, atmosElement } = this.state;
    const fabric = this.fabric;
    const canvas = this.canvas;

    if(fabric && canvas) {
      let thumbnailUrl = '/imgs/no-artwork-2.png';
      if(project && artworks && artworks.length > 0) {
        thumbnailUrl = artworks[0].thumbnail;
      }

      if(thumbnailUrl != this.thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;

        if(this.thumbnailImage) {
          canvas.remove(this.thumbnailImage);
        }

        const thumbnail = new Image();
        thumbnail.onload = () => {
          const thumbnailImage = new fabric.Image(thumbnail);

          canvas.setBackgroundImage(thumbnailImage);
          //canvasHeight = thumbnail.width / canvasWidth * thumbnail.height;
          //canvas.setHeight(canvasHeight);
          //canvas.setWidth(canvasWidth);
          canvas.renderAll();

          this.thumbnailImage = thumbnailImage;
          this.renderCanvas();
          const runthis = this.renderCanvas()
          setTimeout(function() {
            runthis;
          }, 4000);
          //this.setState({canvasHeight});
        }
        thumbnail.src = thumbnailUrl.replace("http:", "https:");
      }

      canvas.setHeight(canvasHeight);
      canvas.setWidth(canvasWidth);
      
      let watermarkUrl = null;
      if(defaultBranding) {
        if (canvasShape == "square") {
          watermarkUrl = '/imgs/arttracks-watermark-vertical.png';
        } else {
          watermarkUrl = '/imgs/arttracks-watermark.png';
        }
      }
      else {
        let watermarkSrc = null;
        if(project && project.watermark) {
          watermarkSrc = project.watermark;
        }
        if(watermarkSrc && customBranding) {
          watermarkUrl = watermarkSrc;
        }
      }
      
      if(watermarkUrl != this.watermarkUrl) {
        this.watermarkUrl = watermarkUrl;

        if(this.watermarkImage) {
          canvas.remove(this.watermarkImage);
        }

        if(watermarkUrl) {
          const watermark = new Image();
          watermark.onload = () => {
            const watermarkImage = new fabric.Image(watermark, {
              cornerColor: 'green',
              borderColor: 'green',
              cornerSize: 8,
              lockRotation: true,
              opacity: parseInt(opacity, 10)/100,
            });

            let orientation = "landscape";
            let aspectRatio = watermark.width / watermark.height;
            let width = watermark.width;
            let height = watermark.height;

            if(watermark.width < watermark.height) {
              orientation = "portrait";
            }

            if(orientation == "landscape") {
              width = 100;
              height = width / aspectRatio;
            } else {
              height = 100;
              width = height * aspectRatio;
            }
            
            if(this.watermarkImage) {
              canvas.remove(this.watermarkImage);
            }

            this.watermarkImage = watermarkImage;
            canvas.add(this.watermarkImage);

            if (!watermarkCoords) {
              // Set position to lower left corner
              watermarkPosition.top = 0;
              watermarkPosition.left = 2;

              const coords = {
                width: watermark.width,
                height: watermark.height,
                scaleX: width / watermark.width,
                scaleY: height / watermark.height,
              };
              this.setWatermarkCoords(coords, watermarkPosition);
            } else {
              this.renderCanvasWatermark();
            }
          }
          watermark.src = watermarkUrl.replace("http:", "https:");
        }
      }
      else if(defaultBranding || customBranding) {
        this.renderCanvasWatermark();
      }

      // Atmospherics stuff. First establish location of the overlay image
      let atmosUrl = atmosImages[atmosType];

      if(atmosElement) {

        if(atmosUrl != this.atmosUrl) {

          this.atmosUrl = atmosUrl;

          // Create new image object to add to canvas
          const atmospheric = new Image();
          atmospheric.src = atmosUrl;

          atmospheric.onload = () => {
            const atmosphericImage = new fabric.Image(atmospheric);
            var fw, fh

            let width_ratio  = canvasWidth  / atmosphericImage.width;
            let height_ratio = canvasHeight / atmosphericImage.height;
            if (width_ratio > height_ratio) {
                fw = atmosphericImage.width * width_ratio;
                fh = atmosphericImage.height*fw/atmosphericImage.width;
            } else {
                fh = atmosphericImage.height * height_ratio;
                fw = atmosphericImage.width*fh/atmosphericImage.height;    
            }

            let options = {
              top: 0,
              left: 0,
              width: fw,
              height: fh,
            }

            atmosphericImage.set(options);

            if(this.atmosphericImage) {
              canvas.remove(this.atmosphericImage);
            }

            this.atmosphericImage = atmosphericImage;

            canvas.add(atmosphericImage);
            //canvas.moveTo(atmosphericImage, 99);

            //canvasHeight = thumbnail.width / canvasWidth * thumbnail.height;
            //canvas.setHeight(canvasHeight);
            //canvas.setWidth(canvasWidth);
            canvas.renderAll();

            this.renderCanvas();
            //this.setState({canvasHeight});
          }

          //thumbnail.src = thumbnailUrl.replace("http:", "https:");

        }

      } else {
        if(this.atmosphericImage) {
          canvas.remove(this.atmosphericImage);
          this.atmosUrl = null;
        }
      }

      // Add image canvas. Scale to heigh of canvas while maintaining aspect ratio
      //canvas.add(this.atmosphericImage);
    }
  }

  renderAtmosphericOverlay() {
    const { atmosElement, atmosType, canvasWidth, canvasHeight, canvasShape } = this.state;
    const fabric = this.fabric;
    const canvas = this.canvas;

    if(fabric && canvas) {

      let options = {
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
      };

      if(this.atmosOverlay) {

        canvas.remove(this.atmosOverlay);

        this.atmosOverlay.set(options);

        canvas.add(this.atmosOverlay);

      }
    }
  }

  renderCanvasWatermark() {
    const { customBranding, defaultBranding, opacity, watermarkCoords, canvasWidth, canvasHeight, canvasShape } = this.state;
    const fabric = this.fabric;
    const canvas = this.canvas;

    if(fabric && canvas) {
      if(this.watermarkImage && watermarkCoords) {
        let options = {
          left: watermarkCoords.left,
          top: watermarkCoords.top,
          scaleX: watermarkCoords.scaleX,
          scaleY: watermarkCoords.scaleY,
          opacity: parseInt(opacity, 10)/100,
        };

        if(customBranding) {
          options = {
            ...options,
            selectable: true,
            lockMovementX: false,
            lockMovementY: false,
            lockScalingX: false,
            lockScalingY: false,
            hasControls: true,
            hasBorders: true,
            hoverCursor: 'move',
          };
        }
        else if(defaultBranding) {
          let width = 143;
          let height = 34;
          var left, top;

          if (canvasShape == "square") {
            left = 15;
            top = 0;
          } else {
            left = canvasWidth - width;
            top = canvasHeight - height - 15;
          }
          options = {
            left: left,
            top: top,
            scaleX: 1,
            scaleY: 1,
            opacity: parseInt(opacity, 10)/100,
            selectable: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            hasBorders: false,
            hoverCursor: 'help',
          };
        }
        canvas.remove(this.watermarkImage);
        this.watermarkImage.set(options);
        canvas.add(this.watermarkImage);
      }
    }
  }

  renderWatermarkSetting() {
    const { project } = this.props;
    const { defaultBranding, customBranding, watermarkPosition } = this.state;

    let watermarkSrc = null;
    if(project && project.watermark) {
      watermarkSrc = <img src={project.watermark.replace("http:", "https:")} />;
    }

    let watermarkAction = null;
    if(project && project.watermark) {
      return (
        <FormGroup>
          <Col sm={5}>
            <Dropzone onDrop={this.onDrop} disableClick={true} multiple={false} maxSize={15 * 1024 * 1024}
                accept="image/*" activeClassName="active-dropzone" className="watermark-preview">
              { watermarkSrc }
            </Dropzone>
            <p className="pt2 text-center"><a href="javascript:;" onClick={this.deleteWatermark}>Remove</a></p>
          </Col>
          <Col sm={7} className="pl0">
            <GridMarker selected={watermarkPosition} select={this.selectWatermarkPosition}/>
          </Col>
        </FormGroup>
      );
    }
    else {
      return (
        <FormGroup>
          <Col sm={5}>
            <Dropzone onDrop={this.onDrop} disableClick={true} multiple={false} maxSize={15 * 1024 * 1024}
                accept="image/*" activeClassName="active-dropzone" className="watermark-preview">
            </Dropzone>
          </Col>
          <Col sm={7} className="pt2 pl0">
            Drag and drop your<br/>image into this box or <br/>
            <a href="javascript:;" onClick={this.uploadWatermark}>Click to Upload</a>
          </Col>
        </FormGroup>
      );
    }
  }

  render() {
    const { status, statusText, project, artworks, router } = this.props;
    const { titleAnimation, textColor, backColor, defaultBranding, customBranding, opacity, eqElement, atmosElement, eqColor, eqStyle, eqStyles, watermarkPosition, canvasWidth, canvasHeight, canvasShape } = this.state;

    let alert = null;
    if(status == 'failed') {
      alert = <Alert danger>{ statusText }</Alert>;
    }
    else if(status == 'saving') {
      alert = <Alert info>Saving, please wait...</Alert>;
    }

    let centerTitle = null;
    if (canvasShape == "square" || canvasShape == "vertical") {
      centerTitle = "center-title";
    }

    let playTitle = null;
    if(project && titleAnimation) {
      playTitle = <div className={`play-title ${centerTitle}`} style={{color: textColor, backgroundColor: backColor}}>
        <span className="title">Track Title</span>
        <span className="subtitle">Artist Name</span>
      </div>;
    }

    let eqPreview = null;
    if(eqElement) {
      if(eqStyle == "spectrum") {
        eqPreview = (
          <div className={`eq eq-${eqStyle}`}>
            <IconEQSpectrumSvg eqColor={eqColor} />
          </div>
        )
      } else if (eqStyle == "bounce") {
        eqPreview = (
          <div className={`eq eq-${eqStyle}`}>
            <IconEQBounceSvg eqColor={eqColor} />
          </div>
        )
      } else {
        eqPreview = (
          <div className={`eq eq-${eqStyle}`}>
            <IconEQNormalSvg eqColor={eqColor} />
          </div>
        )
      }
    }

    let atmosPreview = null;
    if(atmosElement) {
      // TODO: Implement code to display the "snow" overlay graphic in the canvas object
    }

    return (
      <div id='body' className="project-body project-settings">
        <ProjectHeader router={router} />

        <div className="body-sidebar__container wide-sidebar">
          <div className="container__with-scroll">
            <div id="alert-box">
              <ProjectAlert />
            </div>

            <Row>
              <Col sm={12}>
                <h3 className="header">Preview</h3>
                <div className="artwork-preview" style={{width: canvasWidth}}>
                  <div className="canvas-wrapper">
                    <canvas id="canvas"></canvas>
                  </div>
                  { playTitle }
                  {/*{ watermarkPreview }*/}
                  { eqPreview }
                </div>
                <p className="mini-text text-center mt1">
                  <strong>Note:</strong> This preview is not a fully accurate depiction of what your final video will look like.
                </p>
              </Col>
            </Row>
          </div>

          <div className="body-sidebar__element">
            <div className="scroll-container">
              <div className="pr5-imp pl5-imp scroll-box">
                <h4 className="header">Atmosperic Visuals <span className="attention-text">New!</span></h4>
                <Form horizontal className="form-settings">
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={8}>Activate Snow</Col>
                    <Col sm={4} className="text-right">
                      <img src="/imgs/icons/icon-stocking.png" height="34" title="Christmas stocking" alt="Christmas stocking" />&nbsp;&nbsp;
                      <Toggle checked={atmosElement} onChange={this.toggleAtmosElement} />
                    </Col>
                  </FormGroup>
                </Form>

                <h4 className="header">Title Label</h4>
                <Form horizontal className="form-settings">
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={8}>Play title animation</Col>
                    <Col sm={4} className="text-right">
                      <Toggle checked={titleAnimation} onChange={this.toggleTitleAnimation} />
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={8}>Text color</Col>
                    <Col sm={4} className="text-right">
                      <FormControl id='text-colorpicker' />
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={8}>Background color</Col>
                    <Col sm={4} className="text-right">
                      <FormControl id='background-colorpicker' />
                    </Col>
                  </FormGroup>
                </Form>

                <h4 className="header">Logo Branding</h4>
                <Form horizontal className="form-settings">
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={8}>Show ArtTracks watermark</Col>
                    <Col sm={4} className="text-right">
                      <Toggle checked={defaultBranding} onChange={this.toggleDefaultBranding} />
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={8}>Use custom watermark</Col>
                    <Col sm={4} className="text-right">
                      <Toggle checked={customBranding} onChange={this.toggleCustomBranding} />
                    </Col>
                  </FormGroup>
                  { this.renderWatermarkSetting() }
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={12}>Set watermark transparency</Col>
                  </FormGroup>
                  <FormGroup>
                    <Col sm={12}>
                      <Slider value={opacity} min={40} onChange={this.handleOpacity}
                        tipFormatter={this.percentFormatter} tipTransitionName="rc-slider-tooltip-zoom-down"/>
                    </Col>
                  </FormGroup>
                </Form>

                <h4 className="header">Audio Visualizer</h4>
                <Form horizontal className="form-settings">
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={8}>Show EQ</Col>
                    <Col sm={4} className="text-right">
                      <Toggle checked={eqElement} onChange={this.toggleEQElement} />
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={8}>EQ color</Col>
                    <Col sm={4} className="text-right">
                      <FormControl id='eq-colorpicker' />
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={8}>EQ style</Col>
                    <Col sm={4} className="text-right">
                      <select className="eq-style" ref="eqStyleSelector" onChange={this.changeEQStyle} value={eqStyle}>
                        { eqStyles.map((style, i) => <option key={i} value={style.toLowerCase()}>{style}</option>) }
                      </select>
                    </Col>
                  </FormGroup>
                </Form>
              </div>

              <div className="scroll-container__actions">
                <div className="pr2-imp pl2-imp">
                  <Row>
                    <Col sm={9}>
                      <Button lg onClick={this.saveSettings} className="btn-primary btn-block">
                        { status == 'saving'? <ButtonLoader primary={true} />: 'Save' }
                      </Button>
                    </Col>
                    <Col sm={3} className="text-right pt2" style={{"textAlign": "center", "paddingTop": "13px"}}>
                      <a href="javascript:;" onClick={this.resetSettings} className="text-primary">Reset</a>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.project.status,
  statusText: state.project.statusText,
  project: state.project.project,
  artworks: state.artwork.artworks,
  userPlan: state.profile.userPlan,
  plans: state.plan.plans,
});

export default connect(mapStateToProps)(ProjectSettings);