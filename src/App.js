import React, {Component} from 'react';
import './App.css';
import {TimeControls} from "./components/time-controls";
import {Subject} from "rxjs";
import * as strava from 'strava-v3';
import {config} from "./config";
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import {LineGraph} from "./components/line-graph";

class App extends Component {

  componentWillMount() {
    this.timeUpdatedSubject = new Subject();
  }

  componentDidMount() {

    strava.athlete.listActivities({access_token: config.access_token}, (err, rides) => {
      if (err) {
        this.setState({error: err});
        return;
      }
      this.setState({rides: rides, limits: this.state ? this.state.limits : {start: 0, end: 24}});

      this.timeUpdatedSubject.asObservable()
        .debounceTime(500)
        .subscribe(x => {
          this.setState({...this.state, limits: x})
        });
    });
  }

  render() {
    if (!this.state) {
      return <span>Loading...</span>
    }

    if (this.state.error) {
      return <h1>Error: {JSON.stringify(this.state.error)}</h1>
    }

    return (
      <div className="App">
        <header className="App-header">
          <TimeControls timeUpdated={this.timeUpdatedSubject}/>
          {/*<TimeControlsCycle />*/}
        </header>
        <div className="container">
          <LineGraph data={this.state.rides} size={{height: 500, width: 1000}} limits={this.state.limits}/>
        </div>
      </div>
    );
  }
}

export default App;
