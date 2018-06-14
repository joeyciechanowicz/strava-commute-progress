import {Component} from "react/cjs/react.production.min";
import * as React from "react";
import {Subject, Observable} from "rxjs";

export class TimeControlsCycle extends Component {

  componentDidMount() {
    const reducer$ = new Subject();

    const state$ = reducer$.asObservable()
      .scan((acc, curr) => {
        return curr(acc)
      }, void 0);

    const sources = {
      state$: state$
    };

    const sinks = this.main(sources);

    this.domSub = sinks.DOM$.subscribe(
      (elements) => this.setState(elements)
    );

    if (sinks.reducer$) {
      this.reducerSub = sinks.reducer$.subscribe(
        (next) => reducer$.next(next),
        (error) => reducer$.error(error),
        () => reducer$.complete()
      );
    }
  }

  componentWillUnmount() {
    this.reducerSub.unsubscribe();
    this.domSub.unsubscribe();
  }

  main(sources) {
    const vdom$ = sources.state$.map(state => (
      <div>
        <label for="start-time-slider">Start time
          <input type="range" id="start-time-slider" value={state.start}/>
        </label>
        <label for="end-time-slider">Start time
          <input type="range" id="end-time-slider" value={state.start}/>
        </label>
      </div>
    ));

    const initialReducer$ = Observable.of(() => {
      console.log('Initial state');
      return ({
        start: 0,
        end: 24
      })
    });

    const start$ = Observable.fromEvent(document.getElementById('start-time-slider'), 'change')
      .map(x => x.value)
      .map(x => ({type: 'START_CHANGE', value: x}));
    const end$ = Observable.fromEvent(document.getElementById('end-time-slider'), 'change')
      .map(x => x.value)
      .map(x => ({type: 'END_CHANGE', value: x}));

    const reducer$ = Observable.merge(start$, end$)
      .map(action => {
        switch (action.type) {
          case 'START_CHANGE':
            return (prev) => ({...prev, start: action.value});
          case 'END_CHANGE':
            return (prev) => ({...prev, end: action.value});
          default:
            throw new Error(`Unsupported time-controls action: ${action.type}`);
        }
      });

    return {
      DOM$: vdom$,
      reducers$: Observable.concat(initialReducer$, reducer$)
    }
  }

  render() {
    return this.state;
  }
}
