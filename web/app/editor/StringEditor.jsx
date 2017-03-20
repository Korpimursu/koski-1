import React from 'react'
import Bacon from 'baconjs'
import {modelData, modelSetData} from './EditorModel.js'

export const StringEditor = React.createClass({
  render() {
    let {model} = this.props
    let {valueBus} = this.state

    let onChange = (event) => {
      valueBus.push([model.context, modelSetData(model, event.target.value)])
    }

    return model.context.edit
      ? <input type="text" defaultValue={modelData(model)} onChange={ onChange }></input>
      : <span className="inline string">{modelData(model).split('\n').map((line, k) => <span key={k}>{line}<br/></span>)}</span>
  },

  getInitialState() {
    return {valueBus: Bacon.Bus()}
  },

  componentDidMount() {
    this.state.valueBus.onValue((v) => {this.props.model.context.changeBus.push(v)})
  }
})
StringEditor.canShowInline = () => true