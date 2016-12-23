import React from 'react'
import Bacon from 'baconjs'
import Http from './http'
import {navigateToOppija, showError} from './location'
import {isValidHetu} from './hetu'
import {Opiskeluoikeus} from './CreateOpiskeluoikeus.jsx'
import { formatISODate } from './date.js'

export const CreateOppija = React.createClass({
  render() {
    const opiskeluoikeus = this.state.opiskeluoikeus
    const {etunimet, sukunimi, kutsumanimi, hetu, inProgress} = this.state
    const validKutsumanimi = this.isKutsumanimiOneOfEtunimet(kutsumanimi, etunimet)
    const submitDisabled = !etunimet || !sukunimi || !kutsumanimi || !isValidHetu(hetu) || !validKutsumanimi || inProgress || !opiskeluoikeus.valid
    const buttonText = !inProgress ? 'Lisää henkilö' : 'Lisätään...'
    const hetuClassName = !hetu ? 'hetu' : isValidHetu(hetu) ? 'hetu' : 'hetu error'
    const kutsumanimiClassName = validKutsumanimi ? 'kutsumanimi' : 'kutsumanimi error'

    const errors = []

    if(!validKutsumanimi) {
      errors.push(<li key='2' className='kutsumanimi'>Kutsumanimen on oltava yksi etunimistä.</li>)
    }

    return (
      <form className='main-content oppija uusi-oppija' onInput={this.onInput}>
        <label className='etunimet'>
          Etunimet
          <input ref='etunimet'></input>
        </label>
        <label className={kutsumanimiClassName}>
          Kutsumanimi
          <input ref='kutsumanimi'></input>
        </label>
        <label className='sukunimi'>
          Sukunimi
          <input ref='sukunimi'></input>
        </label>
        <label className={hetuClassName}>
          Henkilötunnus
          <input ref='hetu'></input>
        </label>
        <hr/>
        <Opiskeluoikeus opiskeluoikeusBus={this.state.opiskeluoikeusBus}/>
        <button className='button' disabled={submitDisabled} onClick={this.submit}>{buttonText}</button>
        <ul className='error-messages'>
          {errors}
        </ul>
      </form>
    )
  },

  getInitialState() {
    return {etunimet: '', sukunimi: '', kutsumanimi: '', hetu: '', opiskeluoikeus: {valid: false}, opiskeluoikeusBus: Bacon.Bus()}
  },

  oppijaFromDom() {
    return {
      etunimet: this.refs.etunimet.value,
      sukunimi: this.refs.sukunimi.value,
      kutsumanimi: this.refs.kutsumanimi.value,
      hetu: this.refs.hetu.value.toUpperCase()
    }
  },

  componentDidMount() {
    this.state.opiskeluoikeusBus.onValue(o => {this.setState({opiskeluoikeus: o})})
    this.refs.etunimet.focus()
  },

  onInput() {
    this.setState(this.oppijaFromDom())
  },

  submit(e) {
    e.preventDefault()
    this.setState({inProgress: true})
    const createOppijaS = Http.put('/koski/api/oppija',  this.toCreateOppija()).map(oppija => ({oid: oppija.henkilö.oid}))
    createOppijaS.onValue(navigateToOppija)
    createOppijaS.onError((error) => {
      this.setState({inProgress: false})
      showError(error)
    })
  },

  toCreateOppija() {
    const {etunimet, sukunimi, kutsumanimi, hetu} = this.oppijaFromDom()
    const {tutkinto: tutkinto, oppilaitos: oppilaitosOrganisaatio} = this.state.opiskeluoikeus
    const date = new Date()
    return {
      henkilö: {
        etunimet: etunimet,
        sukunimi: sukunimi,
        kutsumanimi: kutsumanimi,
        hetu: hetu
      },
      opiskeluoikeudet: [{
        tyyppi: { 'koodistoUri': 'opiskeluoikeudentyyppi', 'koodiarvo': 'ammatillinenkoulutus'},
        oppilaitos: oppilaitosOrganisaatio,
        alkamispäivä: formatISODate(date),
        tila: {
          opiskeluoikeusjaksot: [ { alku: formatISODate(date), tila: { 'koodistoUri': 'koskiopiskeluoikeudentila', 'koodiarvo': 'lasna' } }]
        },
        suoritukset: [{
          koulutusmoduuli: {
            tunniste: {
              koodiarvo: tutkinto.tutkintoKoodi,
              koodistoUri: 'koulutus'
            },
            perusteenDiaarinumero: tutkinto.diaarinumero
          },
          toimipiste : oppilaitosOrganisaatio,
          tila: { 'koodistoUri': 'suorituksentila', 'koodiarvo': 'KESKEN'},
          tyyppi: { 'koodistoUri': 'suorituksentyyppi', 'koodiarvo': 'ammatillinentutkinto'}
        }]
      }]
    }
  },

  isKutsumanimiOneOfEtunimet(kutsumanimi, etunimet) {
    return kutsumanimi && etunimet ? etunimet.split(' ').indexOf(kutsumanimi) > -1 || etunimet.split('-').indexOf(kutsumanimi) > -1: true
  }
})