import React from 'react'
import * as L from 'partial.lenses'
import {modelItems } from './EditorModel.js'
import { Editor } from './GenericEditor.jsx'

export const ArrayEditor = React.createClass({
  render() {
    let {model, reverse} = this.props
    var items = (this.state && this.state.items) || modelItems(model)
    if (reverse && !model.context.edit) items = items.slice(0).reverse()
    let inline = ArrayEditor.canShowInline(this)
    let className = inline
      ? 'array inline'
      : 'array'
    let adding = this.state && this.state.adding || []
    let addItem = () => {
      this.setState({adding: adding.concat(model.prototype)})
    }
    return (
      <ul ref="ul" className={className}>
        {
          items.concat(adding).map((item, i) => {
              let removeItem = () => {
                let newItems = L.set(L.index(i), undefined, items)
                item.context.changeBus.push([item.context, {data: undefined}])
                this.setState({ adding: false, items: newItems })
              }

              return (<li key={i}>
                <Editor model = {item}/>
                {item.context.edit && <a className="remove-item" onClick={removeItem}></a>}
              </li>)
            }
          )
        }
        {
          model.context.edit && model.prototype !== undefined ? <li className="add-item"><a onClick={addItem}>lisää uusi</a></li> : null
        }
      </ul>
    )
  }
})
ArrayEditor.canShowInline = (component) => {
  let {model} = component.props
  var items = modelItems(model)
  // consider inlineability of first item here. make a stateless "fake component" because the actual React component isn't available to us here.
  let fakeComponent = {props: { model: items[0] }}
  return Editor.canShowInline(fakeComponent)
}