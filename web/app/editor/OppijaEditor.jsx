import React from 'react'
import R from 'ramda'
import { modelData, modelLookup, modelTitle, modelItems, addContext } from './EditorModel.js'
import { TogglableEditor, PropertyEditor } from './CommonEditors.jsx'
import { PropertiesEditor } from './PropertiesEditor.jsx'
import { ArrayEditor } from './ArrayEditor.jsx'
import Versiohistoria from '../Versiohistoria.jsx'
import Link from '../Link.jsx'
import { currentLocation } from '../location.js'
import { yearFromFinnishDateString } from '../date'
import * as Perusopetus from './Perusopetus.jsx'
import * as Lukio from './Lukio.jsx'
import * as Suoritustaulukko from './Suoritustaulukko.jsx'
import * as Ammatillinen from './Ammatillinen.jsx'
import * as CommonEditors from './CommonEditors.jsx'
import { LuvaEditor } from './LuvaEditor.jsx'

const OppijaEditor = React.createClass({
  render() {
    let {model} = this.props
    let oppijaOid = modelData(model, 'henkilö.oid')

    let selectedTyyppi = currentLocation().params.opiskeluoikeudenTyyppi

    var opiskeluoikeusTyypit = modelLookup(model, 'opiskeluoikeudet').value

    let selectedIndex = selectedTyyppi
      ? opiskeluoikeusTyypit.findIndex((opiskeluoikeudenTyyppi) => selectedTyyppi == modelData(opiskeluoikeudenTyyppi, 'tyyppi.koodiarvo'))
      : 0

    return (
      <div>
        <ul className="opiskeluoikeustyypit">
          {
            opiskeluoikeusTyypit.map((opiskeluoikeudenTyyppi, tyyppiIndex) => {
              let selected = tyyppiIndex == selectedIndex
              let koodiarvo = modelData(opiskeluoikeudenTyyppi, 'tyyppi.koodiarvo')
              let className = selected ? koodiarvo + ' selected' : koodiarvo
              let content = (<div>
                <div className="opiskeluoikeustyyppi">{ modelTitle(opiskeluoikeudenTyyppi, 'tyyppi') }</div>
                <ul className="oppilaitokset">
                  {
                    modelLookup(opiskeluoikeudenTyyppi, 'opiskeluoikeudet').value.map((oppilaitoksenOpiskeluoikeudet, oppilaitosIndex) =>
                      <li key={oppilaitosIndex}>
                        <span className="oppilaitos">{modelTitle(oppilaitoksenOpiskeluoikeudet, 'oppilaitos')}</span>
                        <ul className="opiskeluoikeudet">
                          {
                            modelLookup(oppilaitoksenOpiskeluoikeudet, 'opiskeluoikeudet').value.map((opiskeluoikeus, opiskeluoikeusIndex) =>
                              modelLookup(opiskeluoikeus, 'suoritukset').value.filter(näytettäväPäätasonSuoritus).map((suoritus, suoritusIndex) =>
                                <li className="opiskeluoikeus" key={opiskeluoikeusIndex + '-' + suoritusIndex}>
                                  <span className="koulutus inline-text">{ modelTitle(suoritus, 'tyyppi') }</span>
                                  { modelData(opiskeluoikeus, 'alkamispäivä')
                                    ? <span className="inline-text">
                                        <span className="alku pvm">{yearFromFinnishDateString(modelTitle(opiskeluoikeus, 'alkamispäivä'))}</span>-
                                        <span className="loppu pvm">{yearFromFinnishDateString(modelTitle(opiskeluoikeus, 'päättymispäivä'))},</span>
                                      </span>
                                    : null
                                  }
                                  <span className="tila">{ modelTitle(opiskeluoikeus, 'tila.opiskeluoikeusjaksot.-1.tila') }</span>
                                </li>
                              )
                            )
                          }
                        </ul>
                      </li>
                    )
                  }
                </ul>
              </div>)
              return (
                <li className={className} key={tyyppiIndex}>
                  { selected ? content : <Link href={'?opiskeluoikeudenTyyppi=' + koodiarvo}>{content}</Link> }
                </li>)
            })}
        </ul>


        <ul className="opiskeluoikeuksientiedot">
          {
            modelLookup(model, 'opiskeluoikeudet.' + selectedIndex + '.opiskeluoikeudet').value.flatMap((oppilaitoksenOpiskeluoikeudet, oppilaitosIndex) => {
              return modelLookup(oppilaitoksenOpiskeluoikeudet, 'opiskeluoikeudet').value.map((opiskeluoikeus, opiskeluoikeusIndex) =>
                <li key={ oppilaitosIndex + '-' + opiskeluoikeusIndex }>
                  <OpiskeluoikeusEditor
                    model={ addContext(opiskeluoikeus, { oppijaOid: oppijaOid }) }
                  />
                </li>
              )
            })
          }
        </ul>
      </div>)
  }
})

const OpiskeluoikeusEditor = React.createClass({
  render() {
    let {model} = this.props
    let context = model.context
    let id = modelData(model, 'id')
    let suoritusQueryParam = context.path + '.suoritus'
    let suoritusIndex = currentLocation().params[suoritusQueryParam] || 0
    let suoritukset = modelItems(model, 'suoritukset')
    let excludedProperties = ['suoritukset', 'alkamispäivä', 'arvioituPäättymispäivä', 'päättymispäivä', 'oppilaitos', 'lisätiedot']
    let päättymispäiväProperty = (modelData(model, 'arvioituPäättymispäivä') && !modelData(model, 'päättymispäivä')) ? 'arvioituPäättymispäivä' : 'päättymispäivä'

    return (<TogglableEditor model={model} renderChild={ (mdl, editLink) => (<div className="opiskeluoikeus">
      <h3>
        <span className="oppilaitos inline-text">{modelTitle(mdl, 'oppilaitos')},</span>
        <span className="koulutus inline-text">{modelTitle(modelLookup(mdl, 'suoritukset').value.find(näytettäväPäätasonSuoritus), 'koulutusmoduuli')}</span>
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
              ? <ArrayEditor reverse={true} model={modelLookup(prop.model, 'opiskeluoikeusjaksot')}/>
              : getDefault() }
           />
          <ExpandablePropertiesEditor model={mdl} propertyName="lisätiedot" />
        </div>
        <div className="suoritukset">
          {
            suoritukset.length >= 2 ? (
              <div>
                <h4>Suoritukset</h4>
                <ul className="suoritus-tabs">
                  {
                    suoritukset.map((suoritusModel, i) => {
                      let selected = i == suoritusIndex
                      let title = modelTitle(suoritusModel, 'koulutusmoduuli')
                      return (<li className={selected ? 'selected': null} key={i}>
                        { selected ? title : <Link href={currentLocation().addQueryParams({[suoritusQueryParam]: i}).toString()}> {title} </Link>}
                      </li>)
                    })
                  }
                </ul>
              </div>
            ) : <hr/>
          }
          {
            suoritukset.map((suoritusModel, i) =>
              i == suoritusIndex
                ? <PäätasonSuoritusEditor model={addContext(suoritusModel, {opiskeluoikeusId: id})} key={i}/> : null
            )
          }
        </div>
      </div>
    </div>)

    } />)
  }
})

const ExpandablePropertiesEditor = React.createClass({
  render() {
    let {model, propertyName} = this.props
    let {open} = this.state
    return modelData(model, propertyName) ?
      <div className={'expandable-container ' + propertyName}>
        <a className={open ? 'open expandable' : 'expandable'} onClick={this.toggleOpen}>{model.value.properties.find(p => p.key === propertyName).title}</a>
        { open ?
          <div className="value">
            <PropertiesEditor model={modelLookup(model, propertyName)} />
          </div> : null
        }
      </div> : null
  },
  toggleOpen() {
    this.setState({open: !this.state.open})
  },
  getInitialState() {
    return {open: false}
  }
})

const PäätasonSuoritusEditor = React.createClass({
  render() {
    let {model} = this.props
    let excludedProperties = ['osasuoritukset', 'käyttäytymisenArvio', 'tila', 'vahvistus', 'jääLuokalle', 'pakollinen']

    let resolveEditor = (mdl) => {
      if (['perusopetuksenvuosiluokansuoritus', 'perusopetuksenoppimaaransuoritus', 'perusopetuksenlisaopetuksensuoritus', 'perusopetukseenvalmistavanopetuksensuoritus'].includes(mdl.value.classes[0])) {
        return <Perusopetus.PerusopetuksenOppiaineetEditor model={mdl}/>
      }
      if (model.value.classes.includes('ammatillinenpaatasonsuoritus')) {
        return <Suoritustaulukko.SuorituksetEditor suoritukset={modelItems(model, 'osasuoritukset') || []}/>
      }
      if (mdl.value.classes.includes('lukionoppimaaransuoritus')) {
        return <Lukio.LukionOppiaineetEditor oppiaineet={modelItems(mdl, 'osasuoritukset') || []} />
      }
      if (mdl.value.classes.includes('lukionoppiaineenoppimaaransuoritus')) {
        return <Lukio.LukionOppiaineetEditor oppiaineet={[mdl]} />
      }
      if (model.value.classes.includes('lukioonvalmistavankoulutuksensuoritus')) {
        return <LuvaEditor suoritukset={modelItems(model, 'osasuoritukset') || []}/>
      }
      return <PropertyEditor model={mdl} propertyName="osasuoritukset"/>
    }

    return (<TogglableEditor
      model={model}
      renderChild={ (mdl, editLink) => {
        let className = 'suoritus ' + (mdl.context.edit ? 'editing ' : '') + mdl.value.classes.join(' ')
        return (<div className={className}>
          {editLink}
          <TodistusLink suoritus={mdl} />
          <PropertiesEditor
            model={mdl}
            propertyFilter={p => !excludedProperties.includes(p.key)}
          />
          <TilaJaVahvistus model={mdl} />
          <div className="osasuoritukset">{resolveEditor(mdl)}</div>
        </div>)
        }
      }
    />)
  }
})

const TilaJaVahvistus = React.createClass({
  render() {
    let { model } = this.props
    return (<div className="tila-vahvistus">
        <span className="tila">
          Suoritus: <span className={ 'VALMIS' == model.value.data.tila.koodiarvo ? 'valmis' : ''}>{ model.value.data.tila.koodiarvo }</span> { /* TODO: i18n */ }
        </span>
        {
          model.value.data.vahvistus && <PropertyEditor model={model} propertyName="vahvistus"/>
        }
        {(() => {
          let jääLuokalle = modelData(model, 'jääLuokalle')
          let luokka = modelData(model, 'koulutusmoduuli.tunniste.koodiarvo')
          if (jääLuokalle === true) {
            return <div>Ei siirretä seuraavalle luokalle</div>
          } else if (jääLuokalle === false && luokka !== '9') {
            return <div>Siirretään seuraavalle luokalle</div>
          }
        })()}
      </div>
    )
  }
})

const TodistusLink = React.createClass({
  render() {
    let {suoritus} = this.props
    let oppijaOid = suoritus.context.oppijaOid
    let suoritustyyppi = modelData(suoritus, 'tyyppi').koodiarvo
    let koulutusmoduuliKoodistoUri = modelData(suoritus, 'koulutusmoduuli').tunniste.koodistoUri
    let koulutusmoduuliKoodiarvo = modelData(suoritus, 'koulutusmoduuli').tunniste.koodiarvo
    let suoritusTila = modelData(suoritus, 'tila').koodiarvo
    let href = '/koski/todistus/' + oppijaOid + '?suoritustyyppi=' + suoritustyyppi + '&koulutusmoduuli=' + koulutusmoduuliKoodistoUri + '/' + koulutusmoduuliKoodiarvo
    return suoritusTila == 'VALMIS' && suoritustyyppi != 'korkeakoulututkinto' && suoritustyyppi != 'preiboppimaara' && suoritustyyppi != 'esiopetuksensuoritus' && !(koulutusmoduuliKoodistoUri == 'perusopetuksenluokkaaste' && koulutusmoduuliKoodiarvo == '9')
      ? <a className="todistus" href={href}>näytä todistus</a>
      : null
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

const OpiskeluoikeusjaksoEditor = React.createClass({
  render() {
    let { model } = this.props
    return (<div className="opiskeluoikeusjakso">
      <label className="date">{modelTitle(model, 'alku')}</label>
      <label className="tila">{modelTitle(model, 'tila')}</label>
    </div>)
  }
})
OpiskeluoikeusjaksoEditor.readOnly = true


const näytettäväPäätasonSuoritus = s => !['perusopetuksenvuosiluokka', 'korkeakoulunopintojakso'].includes(s.value.data.tyyppi.koodiarvo)

export const editorMapping = R.mergeAll([{
  'oppijaeditorview': OppijaEditor,
  'opiskeluoikeusjakso': OpiskeluoikeusjaksoEditor
}, CommonEditors.editorMapping, Ammatillinen.editorMapping, Perusopetus.editorMapping])