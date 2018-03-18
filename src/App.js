import React, { Component } from 'react';
import fetch from 'cross-fetch';
import queryString from 'query-string';
import './App.css';

const client_id = '1c4cb54f37114d12987ef3e327ecaed8';
const redirect_uri = 'http://localhost:3000';

class App extends Component {
  constructor() {
    super();
    let token = sessionStorage.getItem('token');
    if (!token) {
      const hash = window.location.hash;
      if (hash) {
        const tokenObj = queryString.parse(hash);
        token = tokenObj.access_token;
        if (token) {
          sessionStorage.setItem('token', token)
        }
      }
    }
    this.state = {
      images: [],
      next_url: '',
      token
    };
    this.fetchNextPage = this.fetchNextPage.bind(this);
  }
  componentDidMount() {
    if (!this.state.token) {
      window.location = (`https://api.instagram.com/oauth/authorize/?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=token`);
    } else {
      this.fetchImages();
    }
  }
  fetchImages() {
    fetch(`https://api.instagram.com/v1/users/self/media/recent/?count=4&access_token=${this.state.token}`)
      .then(res => res.json()).then(res => this.setState({ images: res.data, next_url: res.pagination.next_url }));
  }
  fetchNextPage() {
    fetch(this.state.next_url).then(res => res.json())
      .then(res => this.setState({
        images: [ ...this.state.images, ...res.data ],
        next_url: res.pagination.next_url
      }));
  }
  render() {
    return (
      <div className="App">
        <ul>
          {this.state.images.map(image => <li key={image.id}>
            <img src={image.images.thumbnail.url} />
          </li>)}
        </ul>
        <div onClick={this.fetchNextPage}>Load More</div>
      </div>
    );
  }
}

export default App;
