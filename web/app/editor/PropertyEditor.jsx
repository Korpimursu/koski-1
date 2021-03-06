import React from 'react'
import { Editor } from './GenericEditor.jsx'

export const PropertyEditor = React.createClass({
  render() {
    let {propertyName, model} = this.props
    let property = model.value.properties.find(p => p.key == propertyName)
    if (!property) return null
    return (<span className={'single-property property ' + property.key}>
      <span className="label">{property.title}</span>: <span className="value"><Editor model = {property.model}/></span>
    </span>)
  }
})
