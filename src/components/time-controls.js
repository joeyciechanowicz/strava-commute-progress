import React, {Component} from 'react';

export class TimeControls extends Component {

  componentWillMount() {
    this.setState({start: 1, end: 24})
  }

  updateStartTime(event) {
    const newValue = event.target.value;
    this.setState({...this.state, start: newValue});
  }

  updateEndTime(event) {
    const newValue = event.target.value;
    this.setState({...this.state, end: newValue});
  }

  formatNumberAsHour(number) {


    return number <= 12 ? `${number} am` : `${number - 12} pm`
  }

  render() {
    this.props.timeUpdated.next(this.state);

    return (
      <div>
        <label>Every ride that started after {this.formatNumberAsHour(this.state.start)}
          <input type="range" id="start-time-slider" min="1" max="24" defaultValue="1" step="1" onChange={this.updateStartTime.bind(this)}/>
        </label>
        <label>
          but before
          <input type="range" id="end-time-slider" min="0" max="24" step="1" defaultValue="24" onChange={this.updateEndTime.bind(this)}/>
          {this.formatNumberAsHour(this.state.end)}
        </label>
      </div>
    );
  }
}
