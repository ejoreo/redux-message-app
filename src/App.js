import React, { Component } from 'react'

// PRIMARY CODE //
// We will pass in intialState when we initialize the store
function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];

  //  Part of the Observer Pattern that allows us to modify state in our React app even though state now lives OUTSIDE of the React app
  //  We are 'subscribing' to the Store, using callbacks called listeners to 'listen' for updates to the state
  const subscribe = (listener) => ( listeners.push(listener) )
  const getState = () => (state);

  //  now, when we dispatch, all relevant listeners are triggered
  //  but actually I think right now it is simply ALL listeners that are triggered?
  const dispatch = (action) => {
    state = reducer(state, action);
    //  Note that there are no arguments passed to the listeners.
    //  This callback is solely a notification that the state changed.
    listeners.forEach(l => l());
  };

  return {
    getState,
    dispatch,
    subscribe
  };
}

const reducer = (state, action) => {
  if (action.type === 'ADD_MESSAGE') {
    return {
      // We use .concat() here because it creates a copy of state and THEN modifies it
      messages: state.messages.concat(action.message)
    }
  } else if (action.type === 'DELETE_MESSAGE') {
    return {
      messages: [
        // That new object will contain a new messages array that includes all of the elements in state.messages
        // UP TO the one being removed, as well as every element AFTER the message being removed
        // slice() does not modify the original array!!! it creates a copy!!!!
        ...state.messages.slice(0, action.index),
        ...state.messages.slice(action.index + 1, state.messages.length)
      ]
    }
  } else {
    return state
  }

}

// SECONDARY CODE //
//  Initialize state
const initialState = { messages: [] };

// instantiate a Store object made by createStore()
const store = createStore(reducer, initialState);


class App extends Component {
  componentDidMount() {
    store.subscribe(() => this.forceUpdate())
  }

  render() {
    const messages = store.getState().messages;

    return (
      <div className='ui segment'>
        <MessageView messages={messages} />
        <MessageInput />
      </div>
    );
  }
}

class MessageInput extends Component {
  state = {
    value: '',
  };
  onChange = (e) => {
    this.setState({
      value: e.target.value,
    })
  }

  handleSubmit = () => {
    store.dispatch({
      type: 'ADD_MESSAGE',
      message: this.state.value,
    });
    this.setState({
      value: '',
    });
  };

  render() {
    return (
      <div className='ui input'>
        <input onChange={this.onChange} value={this.state.value} type='text'/>
        <button
          onClick={this.handleSubmit}
          className='ui primary button'
          type='submit'
          >
            Submit
        </button>
      </div>
    );
  }
};

class MessageView extends Component {
  handleClick = (index) => {
    store.dispatch({
      type: 'DELETE_MESSAGE',
      index: index,
    });
  };

  render() {
    const messages = this.props.messages.map((message, index) => (
      //  great format when you want each child to be wrapped in its own div
      <div
        className='comment'
        key={index}
        onClick={() => this.handleClick(index)}
      >
        {message}
      </div>
    ));

    return (
      <div className='ui comments'>
        {messages}
      </div>
    );
  }
}


export default App
