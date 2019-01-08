import React, { Component } from "react";
import { GLSL, Node, Shaders } from "gl-react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
} from "react-native";
import { Permissions, Camera } from "expo";
import { Surface } from "gl-react-expo";

const shaders = Shaders.create({  
  YFlip: {
  // NB we need to YFlip the stream
  frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
gl_FragColor=texture2D(t, vec2(uv.x, 1.0 - uv.y));
}`
}
});



const { width: windowWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  surface: {
    width: windowWidth * 0.3,
    height: windowWidth* 0.4,
    alignSelf: "center"
  },
  fields: {
    flexDirection: "column",
    flex: 1,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "#EEE"
  }
});

export default class App extends Component<*, *> {

  state = {
    permission: null,
  };

  props: {
    position: string
  };

  async componentWillMount() {
    Dimensions.addEventListener('change', () => {
      this.setState({
        screenWidth: Dimensions.get('window').width,
      });
    });
  }

  static defaultProps = {
    position: "front"
  };
  _raf: *;

  async componentDidMount() {
    const permission = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permission });
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      this.forceUpdate();
    };
    this._raf = requestAnimationFrame(loop);
  }

  render() {
    const { permission } = this.state;
    const { position } = this.props;
    const type = Camera.Constants.Type[position];
    
    return (
      <View style={{ flex: 1 }}>
        {permission ? (
          permission.status === "granted" ? (
              <Surface 
              style={styles.surface}
              >
                  <Node
                    shader={shaders.YFlip}
                    uniforms={{
                      t: () => this.camera
                    }}
                  >
                    <Camera
                      style={{
                        width: 400,
                        height: 533.33
                      }}
                      ratio="4:3"
                      type={type}
                      ref={ref => {
                        this.camera = ref;
                      }}
                    />
                  </Node>
              </Surface>
          ) : (
            <Text style={{ padding: 100 }}>Camera permission denied</Text>
          )
        ) : (
          <Text style={{ padding: 100 }}>Loading...</Text>
        )}
      </View>
    );
  }
}
