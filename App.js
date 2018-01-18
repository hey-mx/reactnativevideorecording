/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    ActivityIndicator,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    TouchableOpacity
} from 'react-native';
import Camera from 'react-native-camera';
import Video from 'react-native-video';
import firebase from 'react-native-firebase';


export default class App extends Component {
    state = {
        data: {path: null},
        showCamera: false,
        isRecording: false,
        showPlayer: false,
        seconds: 0,
        intervalId: null,
        showIndicator: false
    };

    uploadVideo = () => {
        this.setState({showIndicator: true});
        /*Only for testing purposes you must to allow read and write rules for any user,
            in contrary case you must implement firebase authentication*/
        firebase.storage()
            .ref('/videos/' + Math.floor((Math.random() * 1000) + 1))
            .putFile(this.state.data.path)
            .then(uploadFile => {
                this.setState({showIndicator: false});
                console.log(uploadFile);
            }).catch(err => console.log(err))
    };

  render() {
    return (
      <View style={styles.container}>
          {this.state.showIndicator ? <ActivityIndicator size="large" /> : null}
        {this.state.showCamera ?
            <Camera 
              ref="camera"
              style={styles.preview}
              captureMode={Camera.constants.CaptureMode.video}
              CaptureTarget={Camera.constants.CaptureTarget.disk}
              CaptureQuality={Camera.constants.CaptureQuality.medium}
              aspect={Camera.constants.Aspect.fill}
              type={Camera.constants.Type.front}>
              {
                !this.state.isRecording ?
                <TouchableOpacity onPress={this.startRecord}>
                  <Text style={styles.capture}>[CAPTURE]</Text>
                </TouchableOpacity> :
                <TouchableOpacity onPress={this.endRecord}>
                  <Text style={styles.capture}>[STOP]</Text>
                </TouchableOpacity>
              }
              <Text style={{color: 'white', fontWeight: '900', alignSelf: 'flex-end', marginRight: 10, marginBottom: 10}}>{this.state.seconds}</Text>
            </Camera>
            :
            <View>
              <TouchableOpacity style={styles.fireButton} onPress={() => this.setState({showCamera: true})}>
                  <Text style={styles.fireButtonText}>Take Video</Text>
              </TouchableOpacity>
              <Text>Video: {this.state.data.path}</Text>
              { this.state.data.path ?
              <View>
                  <TouchableOpacity style={styles.viewButton} onPress={this.uploadVideo}>
                      <Text style={styles.viewButtonText}>Upload Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewButton} onPress={() => this.setState({showPlayer: true}, () => {
                    this.refs.video.presentFullscreenPlayer();
                  })}>
                      <Text style={styles.viewButtonText}>View Video</Text>
                  </TouchableOpacity>
              </View>: null
              }
              {
                this.state.showPlayer ?
                       <Video
                        ref="video"
                        source={{uri: this.state.data.path}}
                        resizeMode="cover"
                        repeat={false}
                        rate={1.0}
                        volume={1.0}
                        onError={(error) => console.log(error)}
                        onEnd={() => this.setState({showPlayer: false})}
                        style={styles.backgroundVideo}
                       />: null
              }
            </View>
        }
          
      </View>
    );
  }

  startRecord = () => {
    console.log('**** START RECORDING ****');
    this.refs.camera.capture({
      mode: Camera.constants.CaptureMode.video,
      target: Camera.constants.CaptureTarget.disk,
      totalSeconds: 20
    })
    .then((data) => {
        this.setState({data});
    })
    .catch((err) => {
        console.log(err)
    });
    const intervalId = setInterval(() => this.recording(), 1000);
    this.setState({isRecording: true, intervalId});
  }

  recording = () => {
    const count = this.state.seconds + 1;
    this.setState({seconds: count});
    if (count > 20) {
        this.endRecord();
        console.log('**** STOP AND CLEANING ****');
    }
  }

  endRecord = () => {
    clearInterval(this.state.intervalId)
    if (this.refs.camera) {
      this.refs.camera.stopCapture();
      this.setState({isRecording: false, showCamera: false, intervalId: null, seconds: 0});
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  },
  fireButton: {
    alignSelf: 'center',
    backgroundColor: 'red',
    margin: 10,
    padding: 10,
  },
  fireButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
  },
  viewButton: {
    alignSelf: 'center',
    backgroundColor: 'blue',
    margin: 10,
    padding: 10,
  },
  viewButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

