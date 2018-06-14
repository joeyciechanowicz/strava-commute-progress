// Really lackluster redux/observable implementation

import {Subject} from "rxjs";
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/startWith';
import {athleteReducer} from "./athlete";
import {ridesReducer} from "./rides";

// Our reducers are functions that return a function

function combineReducers(mapping) {
  return (state, action) => {
    const newState = {};

    for (const key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        newState[key] = mapping[key](state, action);
      }
    }

    return newState;
  };
};

const reducer = combineReducers({
  athlete: athleteReducer,
  rides: ridesReducer
});

const initialState = {
  athlete: null,
  rides: []
};

const actions$ = new Subject();
const state$ = actions$.asObservable()
  .scan(reducer, initialState)
  .share();

export const store = {
  state$: state$,
  actions$: actions$
};
