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
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
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

  loadUser = data => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }});
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    let p = {};
    const allFaces = clarifaiFace.map( ele => {
      p = ele.region_info.bounding_box;
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
      .then(response => {
        if(response){
          fetch('http://localhost:3001/image', { 
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {
                id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}));
          });
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  render() {
    const { isSignedIn, imageUrl, route, boxes } = this.state;
    const {name, entries} = this.state.user;
    return (
      <div className="App">
        <Particles className='particles'
    params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' 
          ? <div><Logo />
                <Rank name={name} entries={entries} />
                <ImageLinkForm 
                  onInputChange={this.onInputChange} 
                  onButtonSubmit={this.onButtonSubmit} />
                <FaceRecoginitionS boxes={boxes} imageUrl={imageUrl}/>
            </div>

         : (
           route === 'signin'
            ? <SignIn loadUser={this.loadUser} onRouteChange = {this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
           )
        }
      </div>
    
    );
  }
}

export default App;
