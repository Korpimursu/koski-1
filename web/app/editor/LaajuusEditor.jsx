import React from 'react'
import {Editor} from './GenericEditor.jsx'
import {modelData} from './EditorModel.js'

export const LaajuusEditor = React.createClass({
  render() {
    let { model } = this.props
    var yksikköData = modelData(model, 'yksikkö')
    let yksikkö = yksikköData && (yksikköData.lyhytNimi || yksikköData.nimi).fi
    return (modelData(model, 'arvo'))
      ? <span className="property laajuus"><span className="value"><Editor model={model} path="arvo"/></span> <span className={'yksikko ' + yksikkö.toLowerCase()}>{yksikkö}</span></span>
      : <span>-</span>
  }
})
LaajuusEditor.readOnly = true