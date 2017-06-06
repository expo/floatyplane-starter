import Expo from 'expo';
import React from 'react';
import {
  Alert,
  Dimensions,
  PanResponder,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import * as Meshes from '../utilities/scene';
import Assets from '../Assets';

// Can't use `import ...` form because THREE uses oldskool module stuff.
const THREE = require('three');

// `THREEView` wraps a `GLView` and creates a THREE renderer that uses
// that `GLView`. The class needs to be constructed with a factory so that
// the `THREE` module can be injected without expo-sdk depending on the
// `'three'` npm package.
const THREEView = Expo.createTHREEViewClass(THREE);

//// Game
// Render the game as a `View` component.

export default class Game extends React.Component {
  state = {
    scoreCount: 0,
    started: false,
  };

  componentWillMount() {
    //// Camera

    // An orthographic projection from 3d to 2d can be viewed as simply dropping
    // one of the 3d dimensions (say 'Z'), after some rotation and scaling. The
    // scaling here is specified by the width and height of the camera's view,
    // which ends up defining the boundaries of the viewport through which the
    // 2d world is visualized.
    //
    // Let `p`, `q` be two distinct points that are sent to the same point in 2d
    // space. The direction of `p - q` (henceforth 'Z') then serves simply to
    // specify depth (ordering of overlap) between the 2d elements of this world.
    //
    // The width of the view will be 4 world-space units. The height is set based
    // on the phone screen's aspect ratio.
    this.width = 4;
    const { width: screenWidth, height: screenHeight } = Dimensions.get(
      'window'
    );
    this.height = screenHeight / screenWidth * this.width;
    this.camera = new THREE.OrthographicCamera(
      -this.width / 2,
      this.width / 2,
      this.height / 2,
      -this.height / 2,
      1,
      10000
    );
    this.camera.position.z = 1000;
    this.animatingIds = [];
    this.scene = new THREE.Scene();
    this.createGameScene();
  }

  //// Scene
  // Creates a new scene for the game, currently only having a blue background
  createGameScene = () => {
    this.background = Meshes.createBackground(this.width, this.height);
    this.scene.add(this.background);
  };

  // Resets the game back to the original state with the start menu
  resetScene = () => {
    this.setState({ started: false });
  };

  // Check if two objects are intersecting in any axis
  intersects = (target, candidate) => {
    const a = new THREE.Box3().setFromObject(target);
    const b = new THREE.Box3().setFromObject(candidate);

    return a.intersectsBox(b);
  };

  //// Events
  // This function is called every frame, with `dt` being the time in seconds
  // elapsed since the last call.
  tick = dt => {};

  // These functions are called on touch of the view.
  touch = (_, gesture) => {};

  //// React component

  // We bind our `touch` and `release` callbacks using a `PanResponder`. The
  // `THREEView` takes our `scene` and `camera` and renders them every frame.
  // It also takes our `tick` callbacks and calls it every frame.
  panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: this.touch,
    onShouldBlockNativeResponder: () => false,
  });

  // Returns the view to be rendered by React
  render() {
    return (
      <View style={{ flex: 1 }}>
        <THREEView
          {...this.viewProps}
          {...this.panResponder.panHandlers}
          scene={this.scene}
          camera={this.camera}
          tick={this.tick}
          style={{ flex: 1 }}
        />
      </View>
    );
  }
}
