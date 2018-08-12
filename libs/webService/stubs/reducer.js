import * as TYPES from './types.js';
import {
  apiReducerHelper as parsonyResponse,
  apiActionHelper,
  REQUEST_STATES
} from '../helpers/apiHelper.js';

import initialState from './initialState';

const STATE_BRANCH = "{{STATE_BRANCH_PLACEHOLDER}}";

export {
  STATE_BRANCH,
  reducer
}

function reducer(state = initialState, action){
  let actionType = apiActionHelper(action.type);
  switch (actionType) {
    default:
      return {...parsonyResponse(state,action)};
  }
}

