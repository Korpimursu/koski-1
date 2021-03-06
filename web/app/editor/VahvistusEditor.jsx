import React from 'react'
import {modelData, modelTitle, modelItems} from './EditorModel.js'

export const VahvistusEditor = React.createClass({
  render() {
    let { model } = this.props
    return (<span className="vahvistus inline">
      <span className="date">{modelTitle(model, 'päivä')}</span>&nbsp;
      <span className="allekirjoitus">{modelTitle(model, 'paikkakunta')}</span>&nbsp;
      {
        (modelItems(model, 'myöntäjäHenkilöt') || []).map( (henkilö,i) =>
          <span key={i} className="nimi">{modelData(henkilö, 'nimi')}</span>
        )
      }
    </span>)
  }
})
