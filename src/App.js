import React, { Component } from 'react';
import fetch from 'cross-fetch';
import queryString from 'query-string';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { GridList, GridTile } from 'material-ui/GridList';
import FlatButton from 'material-ui/FlatButton';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import './App.css';

// Uncheck  Disable implicit OAuth in your instagram developer console
// Enter your client ID and redirect uri
// const client_id = '';
// const redirect_uri = '';

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
    this.setState({ loading: true })
    fetch(`https://api.instagram.com/v1/users/self/media/recent/?count=4&access_token=${this.state.token}`)
      .then(res => res.json()).then(res => this.setState({
        images: res.data,
        next_url: res.pagination.next_url,
        loading: false
      }));
  }
  fetchNextPage() {
    this.setState({ loading: true })
    fetch(this.state.next_url).then(res => res.json())
      .then(res => this.setState({
        images: [ ...this.state.images, ...res.data ],
        next_url: res.pagination.next_url,
        loading: false
      }));
  }
  render() {
    const loader = this.state.loading ?
    <div className="loader-overlay">
      <RefreshIndicator
        size={40}
        status="loading"
        top={134}
        left={149}
        className="loading-indicator"
      />
    </div> : null;
    const loadMore = this.state.next_url ?
      <FlatButton onClick={this.fetchNextPage} label="Load More" /> :
      null;

    return (
      <MuiThemeProvider>
        <div className="App">
          {loader}
          <GridList cellHeight={150} className="grid-list">
            {this.state.images.map(image =>
              <GridTile
                key={image.id}
                title={<span>by <b>{image.user.username}</b></span>}
                subtitle={<a href={image.link}>Link</a>}
                className="grid-tile"
              >
                <img src={image.images.thumbnail.url}/>
              </GridTile>)}
          </GridList>
          {loadMore}
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
