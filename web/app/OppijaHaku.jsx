import React from 'baret'
import Bacon from 'baconjs'
import Http from './http'
import {navigateToOppija, navigateTo} from './location'
import {showError} from './location'

const oppijaHakuE = new Bacon.Bus()

const acceptableQuery = (q) => q.length >= 3

const hakuTulosE = oppijaHakuE.debounce(500)
  .flatMapLatest(query => (acceptableQuery(query) ? Http.get(`/koski/api/henkilo/search?query=${query}`) : Bacon.once({henkilöt: []})).map((results) => ({ results, query })))

hakuTulosE.onError(showError)

const oppijatP = Bacon.update(
  { query: '', results: { henkilöt: []} },
  hakuTulosE.skipErrors(), ((current, hakutulos) => hakutulos)
)

const searchInProgressP = oppijaHakuE.awaiting(hakuTulosE.mapError()).throttle(200)

const canAddP = searchInProgressP.not().and(oppijatP.map(({results}) => results.canAddNew))
const uusiOppijaUrlP = canAddP.and(oppijatP.map(oppijat => '/koski/uusioppija/' + oppijat.query))

export const OppijaHaku = () => (
  <div className={searchInProgressP.map((searching) => searching ? 'oppija-haku searching' : 'oppija-haku')}>
    <div>
      <h3>Hae tai lisää opiskelija</h3>
      <input type="text" id='search-query' placeholder='henkilötunnus, nimi tai oppijanumero' onInput={(e) => oppijaHakuE.push(e.target.value)}></input>
      {
        // TODO: observable embedding for attributes didn't work here in PhantomJS
        Bacon.combineWith(uusiOppijaUrlP, canAddP, (url, canAdd) => (
          <a href={url || ''}
             className={canAdd ? 'lisaa-oppija' : 'lisaa-oppija disabled'}
             onClick={canAdd && ((e) => navigateTo(url, e))}>
            Lisää opiskelija
          </a>
        ))
      }
    </div>
    <div className='hakutulokset'>
      {
        oppijatP.map(oppijat => oppijat.results.henkilöt.length > 0
          ? (<ul> {
              oppijat.results.henkilöt.map((o, i) =>
                <li key={i}><a href={`/koski/oppija/${o.oid}`} onClick={(e) => navigateToOppija(o, e)}>{o.sukunimi}, {o.etunimet} ({o.hetu})</a> </li>
              )
            } </ul>)
          : oppijat.query.length > 2
            ? <div className='no-results'>Ei hakutuloksia</div>
            : null
        )
      }
    </div>
  </div>
)
