import React from 'react'
import {modelData, modelLookup, modelTitle, modelItems, addContext, contextualizeModel, modelEmpty} from './EditorModel.js'
import {PropertyEditor} from './PropertyEditor.jsx'
import {TogglableEditor} from './TogglableEditor.jsx'
import {PropertiesEditor} from './PropertiesEditor.jsx'
import {OpiskeluoikeudenTilaEditor} from './OpiskeluoikeudenTilaEditor.jsx'
import Versiohistoria from '../Versiohistoria.jsx'
import Link from '../Link.jsx'
import {currentLocation} from '../location.js'
import {yearFromFinnishDateString} from '../date'
import {SuoritusEditor} from './SuoritusEditor.jsx'

export const OpiskeluoikeusEditor = React.createClass({
  render() {
    let {model} = this.props
    let context = model.context
    let id = modelData(model, 'id')
    let suoritukset = modelItems(model, 'suoritukset')
    let excludedProperties = ['suoritukset', 'alkamispäivä', 'arvioituPäättymispäivä', 'päättymispäivä', 'oppilaitos', 'lisätiedot']
    let päättymispäiväProperty = (modelData(model, 'arvioituPäättymispäivä') && !modelData(model, 'päättymispäivä')) ? 'arvioituPäättymispäivä' : 'päättymispäivä'

    return (<TogglableEditor model={model} renderChild={ (mdl, editLink) => (<div className="opiskeluoikeus">
      <h3>
        <span className="oppilaitos inline-text">{modelTitle(mdl, 'oppilaitos')},</span>
        <span className="koulutus inline-text">{modelTitle(modelLookup(mdl, 'suoritukset').value.find(SuoritusEditor.näytettäväPäätasonSuoritus), 'koulutusmoduuli')}</span>
         { modelData(mdl, 'alkamispäivä')
            ? <span className="inline-text">(
                  <span className="alku pvm">{yearFromFinnishDateString(modelTitle(mdl, 'alkamispäivä'))}</span>-
                  <span className="loppu pvm">{yearFromFinnishDateString(modelTitle(mdl, 'päättymispäivä'))},</span>
              </span>
            : null
          }
        <span className="tila">{modelTitle(mdl, 'tila.opiskeluoikeusjaksot.-1.tila').toLowerCase()})</span>
        <Versiohistoria opiskeluoikeusId={id} oppijaOid={context.oppijaOid}/>
      </h3>
      <div className="opiskeluoikeus-content">
        <div className={mdl.context.edit ? 'opiskeluoikeuden-tiedot editing' : 'opiskeluoikeuden-tiedot'}>
          {editLink}
          <OpiskeluoikeudenOpintosuoritusoteLink opiskeluoikeus={mdl}/>
          <div className="alku-loppu">
            <PropertyEditor model={mdl} propertyName="alkamispäivä" /> — <PropertyEditor model={mdl} propertyName={päättymispäiväProperty} />
          </div>
          <PropertiesEditor
            model={mdl}
            propertyFilter={ p => !excludedProperties.includes(p.key) }
            getValueEditor={ (prop, getDefault) => prop.key == 'tila'
              ? <OpiskeluoikeudenTilaEditor model={prop.model}/>
              : getDefault() }
           />
          <ExpandablePropertiesEditor model={mdl} propertyName="lisätiedot" />
        </div>
        <div className="suoritukset">
          {
            suoritukset.length >= 2 ? (
              <div>
                <h4>Suoritukset</h4>
                <SuoritusTabs {...{ context, suoritukset}}/>
              </div>
            ) : <hr/>
          }
          {
            suoritukset.map((suoritusModel, i) =>
              i == SuoritusTabs.suoritusIndex(context)
                ? <SuoritusEditor model={addContext(suoritusModel, {opiskeluoikeusId: id})} key={i}/> : null
            )
          }
        </div>
      </div>
    </div>)
    } />)
  }
})

const SuoritusTabs = ({ suoritukset, context }) => (<ul className="suoritus-tabs">
    {
      suoritukset.map((suoritusModel, i) => {
        let selected = i == SuoritusTabs.suoritusIndex(context)
        let title = modelTitle(suoritusModel, 'koulutusmoduuli')
        return (<li className={selected ? 'selected': null} key={i}>
          { selected ? title : <Link href={currentLocation().addQueryParams({[SuoritusTabs.suoritusQueryParam(context)]: i}).toString()}> {title} </Link>}
        </li>)
      })
    }
  </ul>
)
SuoritusTabs.suoritusQueryParam = context => context.path + '.suoritus'
SuoritusTabs.suoritusIndex = (context) => currentLocation().params[SuoritusTabs.suoritusQueryParam(context)] || 0

const ExpandablePropertiesEditor = React.createClass({
  render() {
    let {model, propertyName} = this.props
    let edit = model.context.edit
    let {open, addingModel} = this.state
    // TODO: state needs to reset on context switch (tab switch), how to detect?
    // TODO: similar logic for pushing the newly created value should be included in OptionalEditor, ArrayEditor
    //console.log({edit, open, addingModel})
    let propertiesModel = addingModel || modelLookup(model, propertyName)

    return modelData(model, propertyName) || edit ?
      <div className={'expandable-container ' + propertyName}>
        <a className={open ? 'open expandable' : 'expandable'} onClick={this.toggleOpen}>{model.value.properties.find(p => p.key === propertyName).title}</a>
        { (open && propertiesModel.value) ? // can be "open" without value, when 1. edit, 2. doneWithEdit : still open, but new value from server still missing
          <div className="value">
            <PropertiesEditor model={propertiesModel} />
          </div> : null
        }
      </div> : null
  },
  toggleOpen() {
    let {model, propertyName} = this.props
    let edit = model.context.edit
    let propertiesModel = modelLookup(model, propertyName)
    if (edit && modelEmpty(propertiesModel) && !this.state.addingModel) {
      let addingModel = contextualizeModel(propertiesModel.prototype, propertiesModel.context)
      if (!addingModel.value.data) {
        throw new Error('Prototype value data missing')
      }
        model.context.changeBus.push([addingModel.context, addingModel.value])
      this.setState({addingModel})
    }
    this.setState({open: !this.state.open})
  },
  componentWillReceiveProps(newProps) {
    if (!newProps.model.context.edit && this.props.model.context.edit) { // TODO: this is a bit dirty and seems that it's needed in many editors
      this.setState({ addingModel: undefined})
    }
  },
  getInitialState() {
    return {open: false, addingModel: undefined}
  }
})


const OpiskeluoikeudenOpintosuoritusoteLink = React.createClass({
  render() {
    let {opiskeluoikeus} = this.props
    let oppijaOid = opiskeluoikeus.context.oppijaOid
    var opiskeluoikeusTyyppi = modelData(opiskeluoikeus, 'tyyppi').koodiarvo
    if (opiskeluoikeusTyyppi == 'lukiokoulutus' || opiskeluoikeusTyyppi == 'ibtutkinto') { // lukio/ib näytetään opiskeluoikeuskohtainen suoritusote
      let href = '/koski/opintosuoritusote/' + oppijaOid + '?opiskeluoikeus=' + modelData(opiskeluoikeus, 'id')
      return <a className="opintosuoritusote" href={href}>näytä opintosuoritusote</a>
    } else if (opiskeluoikeusTyyppi == 'korkeakoulutus') { // korkeakoulutukselle näytetään oppilaitoskohtainen suoritusote
      let href = '/koski/opintosuoritusote/' + oppijaOid + '?oppilaitos=' + modelData(opiskeluoikeus, 'oppilaitos').oid
      return <a className="opintosuoritusote" href={href}>näytä opintosuoritusote</a>
    } else {
      return null
    }
  }
})