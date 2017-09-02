import React from 'react';
import ReactPlayer from 'react-player';

import path from 'path';

import { remote } from 'electron';

import screenfull from 'screenfull';

import Duration from './duration';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      source: null,
      playing: false,
      fullscreen: false,
      played: 0,
      loaded: 0,
      volume: 0.5,
      duration: 0,
      playbackRate: 1.0,
      buffering: true,
    };
  }

  minimize = () => {
    remote.getCurrentWindow().minimize();
  }

  maximize = () => {
    if (remote.getCurrentWindow().isMaximized()) {
      remote.getCurrentWindow().unmaximize();
    } else {
      remote.getCurrentWindow().maximize();
    }
  }

  close = () => {
    remote.getCurrentWindow().close();
  }

  onDrop = (e) => {
    e.preventDefault();
    e.persist();

    const data = e.dataTransfer.files;
    if (data.length > 0) {
      this.load(data[0].path);
    } else {
      return null;
    }
  }

  fileDialog = () => {
    remote.dialog.showOpenDialog(
      {
        title: 'Open file',
        filters: [
          {
            name: 'Video',
            extensions: ['avi', 'mp4', 'webm'],
          },
          {
            name: 'Audio',
            extensions: [
              'mp3',
              'flac',
              'ogg',
              'wav',
              'aac',
              'alac',
              'm4a',
            ],
          },
        ],
        properties: ['openFile'],
      },
      (video) => {
        if (video) {
          if (this.state.source !== null) {
            this.setState({ source: null }, () => { this.setState({ source: video }); });
          } else {
            this.setState({ source: video });
          }
        } else {
          return null;
        }
      },
    );
  }

  showURLModal = () => {
    if (document.getElementById('url-modal').style.display !== 'block') { document.getElementById('url-modal').style.display = 'block'; } else { document.getElementById('url-modal').style.display = 'none'; }
  }

  useURL = (e) => {
    e.preventDefault();

    if (e.target.url.value) {
      this.load(e.target.url.value);
      this.showURLModal();
    } else {
      this.showURLModal();
      return null;
    }
  }

  load = (video) => {
    if (this.state.source) {
      this.setState({ source: null }, () => this.setState({ source: video }));
    } else {
      this.setState({ source: video });
    }
  }

  componentDidMount = () => {
    document.getElementById('playindi').style.opacity = '1';
    setTimeout(() => {
      document.getElementById('playindi').style.opacity = '0';
    }, 500);
  }

  indi = () => {
    document.getElementById('playindi').style.opacity = '1';
    setTimeout(() => {
      document.getElementById('playindi').style.opacity = '0';
    }, 300);
  }

   playPause = () => {
     this.indi();
     this.setState({ playing: !this.state.playing });
   }
  stop = () => {
    this.setState({ url: null, playing: false });
  }
  setVolume = (e) => {
    this.setState({ volume: parseFloat(e.target.value) });
  }
  mute = (e) => {
    if (this.state.volume > 0) {
      this.setState({ volume: 0 });
    } else {
      this.setState({ volume: 0.5 });
    }
  }
  setPlaybackRate = (e) => {
    console.log(parseFloat(e.target.value));
    this.setState({ playbackRate: parseFloat(e.target.value) });
  }
  onSeekMouseDown = (e) => {
    this.setState({ seeking: true });
  }
  onSeekChange = (e) => {
    this.setState({ played: parseFloat(e.target.value) });
  }
  onSeekMouseUp = (e) => {
    this.setState({ seeking: false });
    this.player.seekTo(parseFloat(e.target.value));
  }
  onProgress = (state) => {
    if (!this.state.seeking) {
      this.setState(state);
    }
  }

   fullscreen = (e) => {
     if (screenfull.enabled) {
       screenfull.toggle(document.getElementById('yu'));
       this.setState({ fullscreen: !this.state.fullscreen });
     }
   }

  qualitySelector = () => {

  }

  revealPlayer = (e) => {
    document.getElementById('yu-toolbar').style.opacity = 1;
  }

  hidePlayer = (e) => {
    document.getElementById('yu-toolbar').style.opacity = 0;
  }

  buffering = (e) => {
    this.setState({ buffering: true }, () => {
      this.indi();
    });
  }

  render() {
    const {
      playing,
      fullscreen,
      loaded,
      volume,
      duration,
      playbackRate,
      buffering,
      played,
      source,
    } = this.state;
    return (<div>
      <div className="titlebar">
        <section className="left">
          <button onClick={this.fileDialog}><i className="material-icons md-18">add</i></button>
          <button onClick={this.showURLModal}><i className="material-icons md-18">link</i></button>
        </section>
        <section className="center">
          <span>{this.state.source ? path.basename(this.state.source.toString()) : 'Player.js'}</span>
        </section>
        <section className="right">
          <button onClick={this.minimize}><i className="material-icons md-18">minimize</i></button>
          <button onClick={this.maximize}><i className="material-icons md-18">web_asset</i></button>
          <button onClick={this.close}><i className="material-icons md-18">close</i></button>
        </section>
      </div>
      <div className="container" onDrop={this.onDrop}>
        <div id="url-modal"><form onSubmit={this.useURL}><input name="url" /></form></div>
        <div id="yu" className={fullscreen ? 'yu full' : 'yu'}>
          <div className="yu-container" onClick={this.playPause}>
            <div id="playindi"><i className={buffering ? 'mdi owo' : playing ? 'mdi mdi-pause' : 'mdi mdi-play'}>{buffering ? <div className="desu" /> : null}</i></div>
            <ReactPlayer
              id="yu-renderer"
              width="100%"
              height="100%"
              url={source}
              controls
              playing={playing}
              playbackRate={playbackRate}
              volume={volume}
              onStart={() => this.setState({ buffering: false, playing: true }, () => document.getElementById('playindi').style.opacity = 0)}
              onBuffer={this.buffering}
              onReady={() => this.setState({ playing: true, buffering: false })}
              onPause={() => this.setState({ playing: false })}
              onPlay={() => {
                this.setState({ playing: true }, () => this.indi());
              }}
              onEnded={() => this.setState({ playing: false })}
              onError={e => console.error(e)}
              onProgress={this.onProgress}
              onDuration={duration => this.setState({ duration })}
              ref={(player) => { this.player = player; }}
            />
          </div>
          {/* <div id="yu-toolbar" className="yu-toolbar">
            <section className="seeker">
              <input
                type="range"
                step="any"
                onMouseDown={this.onSeekMouseDown}
                onChange={this.onSeekChange}
                onMouseUp={this.onSeekMouseUp}
                min={0}
                max={0.999}
                value={played}
                id="lengthSeeker"
              />
              <progress className="progress" value={played} min={0} max={0.999}>
                <span id="progress-bar" />
              </progress>
              <progress className="progress buffering" value={loaded} min={0} max={0.999}>
                <span id="progress-bar" />
              </progress>
            </section>
            <section>
              <button className="yu-button" onClick={this.playPause}><i className={playing ? 'mdi mdi-pause' : 'mdi mdi-play'} /></button>
              <button className="yu-button" onClick={this.mute}><i className={volume > 0 ? volume === 1 ? 'mdi mdi-volume-high' : 'mdi mdi-volume-medium' : 'mdi mdi-volume-low'} /></button>
              <div className="yu-time">
                <Duration seconds={duration * played} /> / <Duration seconds={duration} />
              </div>
              <div style={{ flexGrow: 1 }} />
              <button className="yu-button" onClick={this.qualitySelector}><i className="mdi mdi-settings" /></button>
              <button className="yu-button" onClick={this.fullscreen}><i className={fullscreen ? 'mdi mdi-fullscreen-exit' : 'mdi mdi-fullscreen'} /></button>
            </section>
          </div> */}
        </div>
      </div>
    </div>);
  }
}
