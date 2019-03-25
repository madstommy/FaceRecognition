import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecoginitionS from './components/FaceRecognitionS/FaceRecognitionS.js';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';


const particlesOptions = {"particles": {
  "number": {
      "value": 100,
      "density": {
        "enable":true,
        "value_area": 800
      }
  },
  "size": {
      "value": 3
  }
},
}
const app = new Clarifai.App({
  apiKey: '5d6a5d7b264f40f1b4e5158571741604'
});

class App extends Component {
  constructor(){
    super();
    this.state={
      input:'',
      imageUrl: '',
      boxes: [],
      route: 'signin',
      isSignedIn: false
    }
  }

  onInputChange = event =>{
    this.setState({input: event.target.value});
  }

  onRouteChange = (route) => {
    
    if(route === 'signout'){
      this.setState({isSignedIn: false});
    } else if(route === 'home'){
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    let p = {};
    const allFaces = clarifaiFace.map( ele => {
      p = ele.region_info.bounding_box;
      console.log(clarifaiFace);
      return {
        leftCol: p.left_col * width,
        topRow: p.top_row * height,
        rightCol: width - (p.right_col * width),
        botRow: height - (p.bottom_row * height)
      }
    })
    return allFaces;
  }

  displayFaceBox = (boxes) => {
    this.setState( {boxes});
  }

  onButtonSubmit=()=>{
    this.setState({imageUrl: this.state.input});
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err));
  }

  render() {
    const { isSignedIn, imageUrl, route, boxes } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
    params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' 
          ? <div><Logo />
                <Rank />
                <ImageLinkForm 
                  onInputChange={this.onInputChange} 
                  onButtonSubmit={this.onButtonSubmit} />
                <FaceRecoginitionS boxes={boxes} imageUrl={imageUrl}/>
            </div>

         : (
           route === 'signin'
            ? <SignIn onRouteChange = {this.onRouteChange} />
            : <Register onRouteChange={this.onRouteChange} />
           )
        }
      </div>
    
    );
  }
}

export default App;
