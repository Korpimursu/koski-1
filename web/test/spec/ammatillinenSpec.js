describe('Ammatillinen koulutus', function() {
  before(Authentication().login())
  
  var addOppija = AddOppijaPage()
  var page = KoskiPage()
  var login = LoginPage()
  var opinnot = OpinnotPage()
  var eero = 'Esimerkki, Eero (010101-123N)'
  
  function addNewOppija(username, hetu, oppijaData) {
    return function() {
      return prepareForNewOppija(username, hetu)()
        .then(addOppija.enterValidDataAmmatillinen(oppijaData))
        .then(addOppija.submitAndExpectSuccess(hetu, (oppijaData || {}).tutkinto))
    }
  }

  describe('Opiskeluoikeuden lisääminen', function() {
    describe('Olemassa olevalle henkilölle', function() {

      describe('Kun lisätään uusi opiskeluoikeus', function() {
        before(addNewOppija('kalle', '280608-6619', { etunimet: 'Tero Terde', kutsumanimi: 'Terde', sukunimi: 'Tunkkila', oppilaitos: 'Stadin', tutkinto: 'Autoalan'}))

        it('Onnistuu, näyttää henkilöpalvelussa olevat nimitiedot', function() {
          expect(page.getSelectedOppija()).to.equal('Tunkkila-Fagerlund, Tero Petteri Gustaf (280608-6619)')
        })
      })
    })

    describe('Uudelle henkilölle', function() {
      before(prepareForNewOppija('kalle', '230872-7258'))

      describe('Aluksi', function() {
        it('Lisää-nappi on disabloitu', function() {
          expect(addOppija.isEnabled()).to.equal(false)
        })
        it('Tutkinto-kenttä on disabloitu', function() {
          expect(addOppija.tutkintoIsEnabled()).to.equal(false)
        })
      })

      describe('Kun syötetään validit tiedot', function() {
        before(addOppija.enterValidDataAmmatillinen())

        describe('Käyttöliittymän tila', function() {
          it('Lisää-nappi on enabloitu', function() {
            expect(addOppija.isEnabled()).to.equal(true)
          })
        })

        describe('Kun painetaan Lisää-nappia', function() {
          before(addOppija.submitAndExpectSuccess('Tyhjä, Tero (230872-7258)', 'Autoalan perustutkinto'))

          it('lisätty oppija näytetään', function() {})

          it('Lisätty opiskeluoikeus näytetään', function() {
            expect(opinnot.getTutkinto()).to.equal('Autoalan perustutkinto')
            expect(opinnot.getOppilaitos()).to.equal('Stadin ammattiopisto')
          })
        })
      })

      describe('Kun kutsumanimi ei löydy etunimistä', function() {
        before(
          prepareForNewOppija('kalle', '230872-7258'),
          addOppija.enterValidDataAmmatillinen({kutsumanimi: 'eiloydy'})
        )
        it('Lisää-nappi on disabloitu', function() {
          expect(addOppija.isEnabled()).to.equal(false)
        })
        it('Näytetään virheilmoitus', function() {
          expect(addOppija.isErrorShown('kutsumanimi')()).to.equal(true)
        })
      })
      describe('Kun kutsumanimi löytyy väliviivallisesta nimestä', function() {
        before(
          addOppija.enterValidDataAmmatillinen({etunimet: 'Juha-Pekka', kutsumanimi: 'Pekka'})
        )
        it('Lisää-nappi on enabloitu', function() {
          expect(addOppija.isEnabled()).to.equal(true)
        })
      })
      describe('Kun oppilaitosta ei ole valittu', function() {
        before(prepareForNewOppija('kalle', '230872-7258'), addOppija.enterValidDataAmmatillinen({oppilaitos: null, tutkinto: null}))
        it('Lisää-nappi on disabloitu', function(){
          expect(addOppija.isEnabled()).to.equal(false)
        })
      })
      describe('Kun oppilaitos on valittu', function() {
        before(addOppija.enterValidDataAmmatillinen())
        it('voidaan valita tutkinto', function(){
          expect(addOppija.tutkintoIsEnabled()).to.equal(true)
          expect(addOppija.isEnabled()).to.equal(true)
        })
        describe('Kun oppilaitos-valinta muutetaan', function() {
          before(addOppija.selectOppilaitos('Omnia'))
          it('tutkinto pitää valita uudestaan', function() {
            expect(addOppija.isEnabled()).to.equal(false)
          })
          describe('Tutkinnon valinnan jälkeen', function() {
            before(addOppija.selectTutkinto('auto'))
            it('Lisää nappi on enabloitu', function() {
              expect(addOppija.isEnabled()).to.equal(true)
            })
          })
        })
      })
      describe('Oppilaitosvalinta', function() {
        describe('Näytetään vain käyttäjän organisaatiopuuhun kuuluvat oppilaitokset', function() {
          it('1', function() {
            return prepareForNewOppija('omnia-palvelukäyttäjä', '230872-7258')()
              .then(addOppija.enterOppilaitos('ammatti'))
              .then(wait.forMilliseconds(500))
              .then(function() {
                expect(addOppija.oppilaitokset()).to.deep.equal(['Omnian ammattiopisto'])
              })
          })
          it('2', function() {
            return prepareForNewOppija('kalle', '230872-7258')()
              .then(addOppija.enterOppilaitos('ammatti'))
              .then(wait.forMilliseconds(500))
              .then(function() {
                expect(addOppija.oppilaitokset()).to.deep.equal(['Lahden ammattikorkeakoulu', 'Omnian ammattiopisto', 'Stadin ammattiopisto'])
              })
          })
        })
        describe('Kun oppilaitosta ei olla valittu', function() {
          before(addOppija.enterData({oppilaitos: undefined}))
          it('Lisää-nappi on disabloitu', function() {
            expect(addOppija.isEnabled()).to.equal(false)
          })
          it('Tutkinnon valinta on estetty', function() {
            expect(addOppija.tutkintoIsEnabled()).to.equal(false)
          })
        })
      })
      describe('Kun tutkinto on virheellinen', function() {
        before(addOppija.enterValidDataAmmatillinen(), addOppija.enterTutkinto('virheellinen'))
        it('Lisää-nappi on disabloitu', function() {
          expect(addOppija.isEnabled()).to.equal(false)
        })
      })
      describe('Kun sessio on vanhentunut', function() {
        before(
          resetFixtures,
          openPage('/koski/uusioppija/230872-7258', function() {return addOppija.isVisible()}),
          addOppija.enterValidDataAmmatillinen(),
          Authentication().logout,
          addOppija.submit)

        it('Siirrytään login-sivulle', wait.until(login.isVisible))
      })

      describe('Kun hetu on virheellinen', function() {
        before(
          Authentication().login(), page.openPage,
          page.oppijaHaku.search('123456-1234', page.oppijaHaku.isNoResultsLabelShown)
        )
        it('Lisää-nappi on disabloitu', function() {
          expect(page.oppijaHaku.canAddNewOppija()).to.equal(false)
        })
      })
      describe('Kun hetu sisältää väärän tarkistusmerkin', function() {
        before(
          Authentication().login(), page.openPage,
          page.oppijaHaku.search('011095-953Z', page.oppijaHaku.isNoResultsLabelShown)
        )
        it('Lisää-nappi on disabloitu', function() {
          expect(page.oppijaHaku.canAddNewOppija()).to.equal(false)
        })
      })
      describe('Kun hetu sisältää väärän päivämäärän, mutta on muuten validi', function() {
        before(
          Authentication().login(), page.openPage,
          page.oppijaHaku.search('300275-5557', page.oppijaHaku.isNoResultsLabelShown)
        )
        it('Lisää-nappi on disabloitu', function() {
          expect(page.oppijaHaku.canAddNewOppija()).to.equal(false)
        })
      })
    })

    describe('Virhetilanteet', function() {
      describe('Kun tallennus epäonnistuu', function() {
        before(
          Authentication().login(),
          openPage('/koski/uusioppija/230872-7258', function() {return addOppija.isVisible()}),
          addOppija.enterValidDataAmmatillinen({sukunimi: "error"}),
          addOppija.submit)

        it('Näytetään virheilmoitus', wait.until(page.isErrorShown))
      })
    })
  })

  describe('Tietojen muuttaminen', function() {
    before(resetFixtures, page.openPage, addNewOppija('kalle', '280608-6619'))

    it('Aluksi ei näytetä \"Kaikki tiedot tallennettu\" -tekstiä', function() {
      expect(page.isSavedLabelShown()).to.equal(false)
    })

    describe('Kun valitaan suoritustapa', function() {
      var suoritusEditor = opinnot.suoritusEditor()
      var suoritustapa = suoritusEditor.property('suoritustapa')
      before(suoritusEditor.edit, suoritustapa.addValue, suoritustapa.waitUntilLoaded, suoritustapa.setValue('ops'), suoritusEditor.doneEditing, wait.until(page.isSavedLabelShown))

      describe('Muutosten näyttäminen', function() {
        it('Näytetään "Kaikki tiedot tallennettu" -teksti', function() {
          expect(suoritustapa.isVisible()).to.equal(true)
          expect(page.isSavedLabelShown()).to.equal(true)
        })
        it('Näytetään muuttuneet tiedot', function() {
          expect(suoritustapa.getValue()).to.equal('Opetussuunnitelman mukainen')
        })
      })

      describe('Kun sivu ladataan uudelleen', function() {
        before(
          page.openPage,
          page.oppijaHaku.search('Tunkkila-Fagerlund', 1),
          page.oppijaHaku.selectOppija('Tunkkila-Fagerlund')
        )

        it('Muuttuneet tiedot on tallennettu', function() {
          expect(suoritustapa.getValue()).to.equal('Opetussuunnitelman mukainen')
        })
      })

      describe('Kun poistetaan suoritustapa', function() {
        before(suoritusEditor.edit, suoritustapa.removeValue, suoritusEditor.doneEditing, wait.until(page.isSavedLabelShown))
        it('Näytetään muuttuneet tiedot', function() {
          expect(suoritustapa.isVisible()).to.equal(false)
        })
      })
    })
  })

  describe('Ammatillinen perustutkinto', function() {
    before(Authentication().login(), resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('280618-402H'))
    describe('Suoritus valmis, kaikki tiedot näkyvissä', function() {
      before(opinnot.expandAll)
      describe('Tietojen näyttäminen', function() {
        it('näyttää opiskeluoikeuden tiedot', function() {
          expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
            'Alkamispäivä : 1.9.2012 — Päättymispäivä : 31.5.2016\n' +
            'Tila 31.5.2016 Valmistunut\n' +
            '1.9.2012 Läsnä')
        })

        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Koulutus Luonto- ja ympäristöalan perustutkinto 62/011/2014\n' +
            'Tutkintonimike Ympäristönhoitaja\nOsaamisala Ympäristöalan osaamisala\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Suorituskieli suomi\n' +
            'Suoritustapa Opetussuunnitelman mukainen\n' +
            'Järjestämismuoto Koulutuksen järjestäminen lähiopetuksena, etäopetuksena tai työpaikalla\n' +
            'Suoritus: VALMIS Vahvistus : 31.5.2016 Helsinki Reijo Reksi')
        })

        it('näyttää tutkinnon osat', function() {
          expect(extractAsText(S('.ammatillisentutkinnonsuoritus > .osasuoritukset'))).to.equal(
            'Tutkinnon osa Pakollisuus Laajuus Arvosana\n' +
            'Kestävällä tavalla toimiminen kyllä 40 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Työssäoppimisjaksot 1.1.2014 — 15.3.2014 Jyväskylä , Suomi\n' +
            'Työtehtävät Toimi harjoittelijana Sortti-asemalla\n' +
            'Laajuus 5 osp\n' +
            'Ympäristön hoitaminen kyllä 35 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Näyttö\n' +
            'Kuvaus Muksulan päiväkodin ympäristövaikutusten arvioiminen ja ympäristön kunnostustöiden tekeminen sekä mittauksien tekeminen ja näytteiden ottaminen\n' +
            'Suorituspaikka Muksulan päiväkoti, Kaarinan kunta\n' +
            'Suoritusaika 1.2.2016 — 1.2.2016\n' +
            'Arvosana kiitettävä\n' +
            'Arviointipäivä 20.10.2014\n' +
            'Arvioitsijat Jaana Arstila (näyttötutkintomestari) Pekka Saurmann (näyttötutkintomestari) Juhani Mykkänen\n' +
            'Arviointikohteet Arviointikohde Arvosana\n' +
            'Työprosessin hallinta kiitettävä\n' +
            'Työmenetelmien, -välineiden ja materiaalin hallinta hyvä\n' +
            'Työn perustana olevan tiedon hallinta hyvä\n' +
            'Elinikäisen oppimisen avaintaidot kiitettävä\n' +
            'Arvioinnista päättäneet Opettaja\n' +
            'Arviointikeskusteluun osallistuneet Opettaja Itsenäinen ammatinharjoittaja\n' +
            'Työssäoppimisen yhteydessä ei\n' +
            'Uusiutuvien energialähteiden hyödyntäminen kyllä 15 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Ulkoilureittien rakentaminen ja hoitaminen kyllä 15 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Kulttuuriympäristöjen kunnostaminen ja hoitaminen kyllä 15 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Näyttö\n' +
            'Kuvaus Sastamalan kunnan kulttuuriympäristöohjelmaan liittyvän Wanhan myllyn lähiympäristön kasvillisuuden kartoittamisen sekä ennallistamisen suunnittelu ja toteutus\n' +
            'Suorituspaikka Sastamalan kunta\n' +
            'Suoritusaika 1.3.2016 — 1.3.2016\n' +
            'Arvosana kiitettävä\n' +
            'Arviointipäivä 20.10.2014\n' +
            'Arvioitsijat Jaana Arstila (näyttötutkintomestari) Pekka Saurmann (näyttötutkintomestari) Juhani Mykkänen\n' +
            'Arviointikohteet Arviointikohde Arvosana\n' +
            'Työprosessin hallinta kiitettävä\n' +
            'Työmenetelmien, -välineiden ja materiaalin hallinta hyvä\n' +
            'Työn perustana olevan tiedon hallinta hyvä\n' +
            'Elinikäisen oppimisen avaintaidot kiitettävä\n' +
            'Arvioinnista päättäneet Opettaja\n' +
            'Arviointikeskusteluun osallistuneet Opettaja Itsenäinen ammatinharjoittaja\n' +
            'Työssäoppimisen yhteydessä ei\n' +
            'Vesistöjen kunnostaminen ja hoitaminen kyllä 15 osp Hyväksytty\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Lisätiedot Muutos arviointiasteikossa\n' +
            'Tutkinnon osa on koulutuksen järjestäjän päätöksellä arvioitu asteikolla hyväksytty/hylätty.\n' +
            'Näyttö\n' +
            'Kuvaus Uimarin järven tilan arviointi ja kunnostus\n' +
            'Suorituspaikka Vesipojat Oy\n' +
            'Suoritusaika 1.4.2016 — 1.4.2016\n' +
            'Arvosana kiitettävä\n' +
            'Arviointipäivä 20.10.2014\n' +
            'Arvioitsijat Jaana Arstila (näyttötutkintomestari) Pekka Saurmann (näyttötutkintomestari) Juhani Mykkänen\n' +
            'Arviointikohteet Arviointikohde Arvosana\n' +
            'Työprosessin hallinta kiitettävä\n' +
            'Työmenetelmien, -välineiden ja materiaalin hallinta hyvä\n' +
            'Työn perustana olevan tiedon hallinta hyvä\n' +
            'Elinikäisen oppimisen avaintaidot kiitettävä\n' +
            'Arvioinnista päättäneet Opettaja\n' +
            'Arviointikeskusteluun osallistuneet Opettaja Itsenäinen ammatinharjoittaja\n' +
            'Työssäoppimisen yhteydessä ei\n' +
            'Kokonaisuus Laajuus Arvosana\n' +
            'Hoitotarpeen määrittäminen Hyväksytty\n' +
            'Viestintä- ja vuorovaikutusosaaminen kyllä 11 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Osa-alue Pakollisuus Laajuus Arvosana\n' +
            'Äidinkieli, Suomen kieli ja kirjallisuus kyllä 5 osp kiitettävä\n' +
            'Äidinkieli, Suomen kieli ja kirjallisuus ei 3 osp kiitettävä\n' +
            'Toinen kotimainen kieli, ruotsi kyllä 1 osp kiitettävä\n' +
            'Vieraat kielet, englanti kyllä 2 osp kiitettävä\n' +
            'Matemaattis-luonnontieteellinen osaaminen kyllä 9 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Lisätiedot Arvioinnin mukauttaminen\n' +
            'Tutkinnon osan ammattitaitovaatimuksia tai osaamistavoitteita ja osaamisen arviointia on mukautettu ammatillisesta peruskoulutuksesta annetun lain (630/1998, muutos 246/2015) 19 a tai 21 §:n perusteella\n' +
            'Osa-alue Pakollisuus Laajuus Arvosana\n' +
            'Matematiikka kyllä 3 osp kiitettävä\n' +
            'Fysiikka ja kemia kyllä 3 osp kiitettävä\n' +
            'Tieto- ja viestintätekniikka sekä sen hyödyntäminen kyllä 3 osp kiitettävä\n' +
            'Alkamispäivä 1.1.2014\n' +
            'Tunnustettu\n' +
            'Tutkinnon osa Asennushitsaus\n' +
            'Tila Suoritus valmis\n' +
            'Selite Tutkinnon osa on tunnustettu Kone- ja metallialan perustutkinnosta\n' +
            'Lisätiedot Arvioinnin mukauttaminen\n' +
            'Tutkinnon osan ammattitaitovaatimuksia tai osaamistavoitteita ja osaamisen arviointia on mukautettu ammatillisesta peruskoulutuksesta annetun lain (630/1998, muutos 246/2015) 19 a tai 21 §:n perusteella\n' +
            'Yhteiskunnassa ja työelämässä tarvittava osaaminen kyllä 8 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Sosiaalinen ja kulttuurinen osaaminen kyllä 7 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Matkailuenglanti ei 5 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Sosiaalinen ja kulttuurinen osaaminen ei 5 osp kiitettävä\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi'
          )
        })
      })

      describe('Tulostettava todistus', function() {
        before(OpinnotPage().avaaTodistus(0))
        it('näytetään', function() {
          expect(TodistusPage().headings()).to.equal('HELSINGIN KAUPUNKIStadin ammattiopistoPäättötodistusLuonto- ja ympäristöalan perustutkintoYmpäristöalan osaamisala, Ympäristönhoitaja Ammattilainen, Aarne (280618-402H)')
          expect(TodistusPage().arvosanarivi('.tutkinnon-osa.100431')).to.equal('Kestävällä tavalla toimiminen 40 Kiitettävä 3')
          expect(TodistusPage().arvosanarivi('.opintojen-laajuus')).to.equal('Opiskelijan suorittamien tutkinnon osien laajuus osaamispisteinä 180')
          expect(TodistusPage().vahvistus()).to.equal('Helsinki 31.5.2016 Reijo Reksi rehtori')
        })
      })
    })

    describe('Suoritus kesken, vanhan perusteen suoritus tunnustettu', function () {
      before(Authentication().login(), resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('140176-449X'), opinnot.expandAll)
      it('näyttää opiskeluoikeuden tiedot', function () {
        expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
          'Alkamispäivä : 1.9.2016 — Arvioitu päättymispäivä : 1.5.2020\n' +
          'Tila 1.9.2016 Läsnä'
        )
      })

      it('näyttää suorituksen tiedot', function () {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Koulutus Autoalan perustutkinto 39/011/2014\n' +
          'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
          'Alkamispäivä 1.9.2016\n' +
          'Suoritustapa Näyttö\n' +
          'Suoritus: KESKEN'
        )
      })

      it('näyttää tutkinnon osat', function () {
        expect(extractAsText(S('.osasuoritukset'))).to.equal(
          'Tutkinnon osa Pakollisuus Laajuus Arvosana\n' +
          'Moottorin ja voimansiirron huolto ja korjaus ei 15 osp Hyväksytty\n' +
          'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
          'Vahvistus 31.5.2013 Reijo Reksi\n' +
          'Tunnustettu\n' +
          'Tutkinnon osa Moottorin korjaus\n' +
          'Kuvaus Opiskelijan on - tunnettava jakopyörästön merkitys moottorin toiminnalle - osattava kytkeä moottorin testauslaite ja tulkita mittaustuloksen suhdetta valmistajan antamiin ohjearvoihin - osattava käyttää moottorikorjauksessa tarvittavia perustyökaluja - osattava suorittaa jakopään hammashihnan vaihto annettujen ohjeiden mukaisesti - tunnettava venttiilikoneiston merkitys moottorin toiminnan osana osatakseen mm. ottaa se huomioon jakopään huoltoja tehdessään - noudatettava sovittuja työaikoja\n' +
          'Tila Suoritus valmis\n' +
          'Vahvistus 28.5.2002 Reijo Reksi\n' +
          'Näyttö\n' +
          'Kuvaus Moottorin korjaus\n' +
          'Suorituspaikka Autokorjaamo Oy, Riihimäki\n' +
          'Suoritusaika 20.4.2002 — 20.4.2002\n' +
          'Työssäoppimisen yhteydessä ei\n' +
          'Selite Tutkinnon osa on tunnustettu aiemmin suoritetusta autoalan perustutkinnon osasta (1.8.2000 nro 11/011/2000)'
        )
      })
    })

  })

  describe('Osittainen ammatillinen tutkinto', function() {
    before(Authentication().login(), resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('230297-6448'))
    describe('Kaikki tiedot näkyvissä', function() {
      before(opinnot.expandAll)
      it('näyttää opiskeluoikeuden tiedot', function() {
        expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
          'Alkamispäivä : 1.9.2012 — Päättymispäivä : 31.5.2016\n' +
          'Tila 31.5.2016 Valmistunut\n' +
          '1.9.2012 Läsnä'
        )
      })

      it('näyttää suorituksen tiedot', function() {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Koulutus Luonto- ja ympäristöalan perustutkinto 62/011/2014\n' +
          'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
          'Suorituskieli suomi\n' +
          'Järjestämismuoto Koulutuksen järjestäminen lähiopetuksena, etäopetuksena tai työpaikalla\n' +
          'Suoritus: VALMIS'
        )
      })

      it('näyttää tutkinnon osat', function() {
        expect(extractAsText(S('.osasuoritukset'))).to.equal(
         'Tutkinnon osa Pakollisuus Laajuus Arvosana\n' +
          'Ympäristön hoitaminen kyllä 35 osp kiitettävä\n' +
          'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
          'Vahvistus 31.5.2016 Reijo Reksi'
        )
      })
    })
  })

  describe('Näyttötutkinnot', function() {
    before(Authentication().login(), resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('250989-419V'), OpinnotPage().valitseSuoritus('Näyttötutkintoon valmistava koulutus'))
    describe('Näyttötutkintoon valmistava koulutus', function() {
      describe('Kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)
        it('näyttää opiskeluoikeuden tiedot', function() {
          expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
            'Alkamispäivä : 1.9.2012 — Päättymispäivä : 31.5.2016\n' +
            'Tila 31.5.2016 Valmistunut\n' +
            '1.9.2012 Läsnä'
          )
        })

        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Koulutus Näyttötutkintoon valmistava koulutus\n' +
            'Tutkinto Autoalan työnjohdon erikoisammattitutkinto 40/011/2001\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Alkamispäivä 1.9.2012\n' +
            'Suoritus: VALMIS Vahvistus : 31.5.2015 Helsinki Reijo Reksi'
          )
        })

        it('näyttää tutkinnon osat', function() {
          expect(extractAsText(S('.osasuoritukset'))).to.equal(
            'Koulutuksen osa Pakollisuus Laajuus Arvosana\n' +
            'Johtaminen ja henkilöstön kehittäminen ei\n' +
            'Auton lisävarustetyöt ei 15 osp'
          )
        })
      })

      describe('Tulostettava todistus', function() {
        before(OpinnotPage().avaaTodistus(0))
        it('näytetään', function() {
          expect(TodistusPage().vahvistus()).to.equal('Helsinki 31.5.2015 Reijo Reksi rehtori')
        })
      })
    })

    describe('Erikoisammattitutkinto', function() {
      before(TodistusPage().close, wait.until(page.isOppijaSelected('Erja')), OpinnotPage().valitseSuoritus('Autoalan työnjohdon erikoisammattitutkinto'))
      describe('Kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)
        it('näyttää opiskeluoikeuden tiedot', function() {
          expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
            'Alkamispäivä : 1.9.2012 — Päättymispäivä : 31.5.2016\n' +
            'Tila 31.5.2016 Valmistunut\n' +
            '1.9.2012 Läsnä'
          )
        })

        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Koulutus Autoalan työnjohdon erikoisammattitutkinto 40/011/2001\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Suorituskieli suomi\n' +
            'Suoritustapa Näyttö\n' +
            'Järjestämismuoto Koulutuksen järjestäminen oppisopimuskoulutuksena\nYritys Autokorjaamo Oy\nY-tunnus 1234567-8\n' +
            'Suoritus: VALMIS Vahvistus : 31.5.2016 Helsinki Reijo Reksi'
          )
        })

        it('näyttää tutkinnon osat', function() {
          expect(extractAsText(S('.osasuoritukset'))).to.equal(
            'Tutkinnon osa Pakollisuus Laajuus Arvosana\n' +
            'Johtaminen ja henkilöstön kehittäminen kyllä Hyväksytty\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Asiakaspalvelu ja korjaamopalvelujen markkinointi kyllä Hyväksytty\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Työnsuunnittelu ja organisointi kyllä Hyväksytty\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Taloudellinen toiminta kyllä Hyväksytty\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi\n' +
            'Yrittäjyys kyllä Hyväksytty\n' +
            'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi'
          )
        })
      })

      describe('Tulostettava todistus', function() {
        before(OpinnotPage().avaaTodistus())
        it('näytetään', function() {
          expect(TodistusPage().vahvistus()).to.equal('Helsinki 31.5.2016 Reijo Reksi rehtori')
        })
      })
    })
  })

  describe('Ammatilliseen peruskoulutukseen valmentava koulutus', function() {
    before(page.openPage, page.oppijaHaku.searchAndSelect('130404-054C'))
    describe('Kaikki tiedot näkyvissä', function() {
      before(opinnot.expandAll)
      it('näyttää opiskeluoikeuden tiedot', function() {
        expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
          'Alkamispäivä : 14.9.2009 — Päättymispäivä : 4.6.2016\n' +
          'Tila 4.6.2016 Valmistunut\n' +
          '14.9.2009 Läsnä'
        )
      })

      it('näyttää suorituksen tiedot', function() {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Koulutus Ammatilliseen peruskoulutukseen valmentava koulutus (VALMA)\n' +
          'Laajuus 60 osp\n' +
          'Toimipiste Stadin ammattiopisto\n' +
          'Suoritus: VALMIS Vahvistus : 4.6.2016 Helsinki Reijo Reksi'
        )
      })

      it('näyttää tutkinnon osat', function() {
        expect(extractAsText(S('.osasuoritukset'))).to.equal(
          'Koulutuksen osa Pakollisuus Laajuus Arvosana\n' +
          'Ammatilliseen koulutukseen orientoituminen ja työelämän perusvalmiuksien hankkiminen kyllä 10 osp Hyväksytty\n' +
          'Opiskeluvalmiuksien vahvistaminen ei 10 osp Hyväksytty\n' +
          'Työssäoppimiseen ja oppisopimuskoulutukseen valmentautuminen ei 15 osp Hyväksytty\n' +
          'Arjen taitojen ja hyvinvoinnin vahvistaminen ei 10 osp Hyväksytty\n' +
          'Auton lisävarustetyöt ei 15 osp Hyväksytty\n' +
          'Tunnustettu\n' +
          'Tutkinnon osa Asennuksen ja automaation perustyöt\n' +
          'Tutkinto Kone- ja metallialan perustutkinto 39/011/2014\n' +
          'Toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
          'Tila Suoritus valmis\n' +
          'Vahvistus 3.10.2015 Helsinki Reijo Reksi\n' +
          'Selite Tutkinnon osa on tunnustettu Kone- ja metallialan perustutkinnosta'
        )
      })
    })

    describe('Tulostettava todistus', function() {
      before(OpinnotPage().avaaTodistus(0))
      it('näytetään', function() {
        // See more detailed content specification in ValmaSpec.scala
        expect(TodistusPage().vahvistus()).to.equal('Helsinki 4.6.2016 Reijo Reksi rehtori')
      })
    })
  })
})