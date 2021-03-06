describe('Perusopetus', function() {
  var page = KoskiPage()
  var login = LoginPage()
  var todistus = TodistusPage()
  var opinnot = OpinnotPage()
  var currentDate = new Date().getDate() + "." + (1 + new Date().getMonth()) + "." + new Date().getFullYear()

  before(Authentication().login(), resetFixtures)

  describe('Perusopetuksen lukuvuositodistukset ja päättötodistus', function() {
    before(page.openPage, page.oppijaHaku.searchAndSelect('220109-784L'))

    it('näyttää opiskeluoikeuden tiedot', function() {
      expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal('Alkamispäivä : 15.8.2008 — Päättymispäivä : 4.6.2016\n' +
        'Tila 4.6.2016 Valmistunut\n' +
        '15.8.2008 Läsnä')
    })

    describe('Perusopetuksen oppimäärä', function() {
      describe('Kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)
        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal('Koulutus Peruskoulu 104/011/2014\n' +
            'Oppimäärä Perusopetus\n' +
            'Toimipiste Jyväskylän normaalikoulu\n' +
            'Suoritustapa Koulutus\n' +
            'Suoritus: VALMIS Vahvistus : 4.6.2016 Jyväskylä Reijo Reksi')
        })
        it('näyttää oppiaineiden arvosanat', function() {
          expect(extractAsText(S('.oppiaineet'))).to.equal(
            'Oppiaineiden arvosanat\n' +
            'Arvostelu 4-10, S (suoritettu), H (hylätty) tai V (vapautettu)\n' +
            'Pakolliset oppiaineet\n' +
            'Oppiaine Arvosana\n' +
            'Äidinkieli ja kirjallisuus 9\n' +
            'B1-kieli, ruotsi 8\n' +
            'A1-kieli, englanti 8\n' +
            'Uskonto tai elämänkatsomustieto 10\n' +
            'Historia 8\n' +
            'Yhteiskuntaoppi 10\n' +
            'Matematiikka 9\n' +
            'Kemia 7\n' +
            'Fysiikka 9\n' +
            'Biologia 9 *\n' +
            'Maantieto 9\n' +
            'Musiikki 7\n' +
            'Kuvataide 8\n' +
            'Kotitalous 8\n' +
            'Terveystieto 8\n' +
            'Käsityö 9\n' +
            'Liikunta 9 **\n' +
            'Valinnaiset oppiaineet\n' +
            'Oppiaine Arvosana Laajuus\n' +
            'Valinnainen b1-kieli, ruotsi S 1 vuosiviikkotuntia\n' +
            'Valinnainen kotitalous S 1 vuosiviikkotuntia\n' +
            'Valinnainen liikunta S 0.5 vuosiviikkotuntia\n' +
            'Valinnainen b2-kieli, saksa 9 4 vuosiviikkotuntia\n' +
            'Tietokoneen hyötykäyttö 9 -\n' +
            '* = yksilöllistetty oppimäärä, ** = painotettu opetus'
          )
        })
      })

      describe('Päättötodistus', function() {
        before(opinnot.avaaTodistus())
        describe('Klikattaessa linkkiä', function() {
          it('näytetään', function() {
            // See more detailed content specification in PerusopetusSpec.scala
            expect(todistus.vahvistus()).to.equal('Jyväskylä 4.6.2016 Reijo Reksi rehtori')
            expect(todistus.arvosanarivi('.muut-opinnot')).to.equal('Muut valinnaiset opinnot')
          })
        })
      })
    })

    describe('Lukuvuosisuoritus 8. luokka', function() {
      before(TodistusPage().close, wait.until(page.isOppijaSelected('Kaisa')), opinnot.valitseSuoritus('8. vuosiluokka'))
      describe('Kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)
        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Luokka-aste 8. vuosiluokka\n' +
            'Luokka 8C\n' +
            'Toimipiste Jyväskylän normaalikoulu\n' +
            'Alkamispäivä 15.8.2014\n' +
            'Suorituskieli suomi\n' +
            'Kielikylpykieli ruotsi\n' +
            'Suoritus: VALMIS Vahvistus : 30.5.2015 Jyväskylä Reijo Reksi\n' +
            'Siirretään seuraavalle luokalle')
        })
        it('näyttää oppiaineiden arvosanat', function() {
          expect(extractAsText(S('.oppiaineet'))).to.equal(
            'Oppiaineiden arvosanat\n' +
            'Arvostelu 4-10, S (suoritettu), H (hylätty) tai V (vapautettu)\n' +
            'Pakolliset oppiaineet\n' +
            'Oppiaine Arvosana\n' +
            'Äidinkieli ja kirjallisuus 9\n' +
            'B1-kieli, ruotsi 8\n' +
            'A1-kieli, englanti 8\n' +
            'Uskonto tai elämänkatsomustieto 10\n' +
            'Historia 8\n' +
            'Yhteiskuntaoppi 10\n' +
            'Matematiikka 9\n' +
            'Kemia 7\n' +
            'Fysiikka 9\n' +
            'Biologia 9 *\n' +
            'Maantieto 9\n' +
            'Musiikki 7\n' +
            'Kuvataide 8\n' +
            'Kotitalous 8\n' +
            'Terveystieto 8\n' +
            'Käsityö 9\n' +
            'Liikunta 9 **\n' +
            'Valinnaiset oppiaineet\n' +
            'Oppiaine Arvosana Laajuus\n' +
            'Valinnainen b1-kieli, ruotsi S 1 vuosiviikkotuntia\n' +
            'Valinnainen kotitalous S 1 vuosiviikkotuntia\n' +
            'Valinnainen liikunta S 0.5 vuosiviikkotuntia\n' +
            'Valinnainen b2-kieli, saksa 9 4 vuosiviikkotuntia\n' +
            'Tietokoneen hyötykäyttö 9 -\n' +
            'Käyttäytymisen arviointi\n' +
            'Arvosana S\n' +
            'Sanallinen arviointi Esimerkillistä käyttäytymistä koko vuoden ajan\n' +
            '* = yksilöllistetty oppimäärä, ** = painotettu opetus'
          )
        })
      })
      describe('Lukuvuositodistus', function() {
        before(opinnot.avaaTodistus())
        it('näytetään', function() {})
      })
    })

    describe('Lukuvuosisuoritus 9. luokka', function() {
      before(TodistusPage().close, wait.until(page.isOppijaSelected('Kaisa')), opinnot.valitseSuoritus('9. vuosiluokka'))
      describe('Kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)
        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Luokka-aste 9. vuosiluokka\n' +
            'Luokka 9C\n' +
            'Toimipiste Jyväskylän normaalikoulu\n' +
            'Alkamispäivä 15.8.2015\n' +
            'Suorituskieli suomi\n' +
            'Suoritus: VALMIS Vahvistus : 30.5.2016 Jyväskylä Reijo Reksi')
        })
      })
      describe('Lukuvuositodistus', function() {
        it('ei näytetä', function() {
          expect(S('a.todistus').is(':visible')).to.equal(false)
        })
      })
    })

    describe('Luokalle jäänyt 7-luokkalainen', function() {
      before(TodistusPage().close, wait.until(page.isOppijaSelected('Kaisa')), opinnot.valitseSuoritus('7. vuosiluokka'))
      describe('Kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)
        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Luokka-aste 7. vuosiluokka\n' +
            'Luokka 7C\n' +
            'Toimipiste Jyväskylän normaalikoulu\n' +
            'Alkamispäivä 15.8.2013\n' +
            'Suorituskieli suomi\n' +
            'Suoritus: VALMIS Vahvistus : 30.5.2014 Jyväskylä Reijo Reksi\n' +
            'Ei siirretä seuraavalle luokalle')
        })
      })
    })

    describe('Päättötodistus toiminta-alueittain', function() {
      before(Authentication().login(), page.openPage, page.oppijaHaku.searchAndSelect('031112-020J'))
      describe('Kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)

        it('näyttää opiskeluoikeuden tiedot', function() {
          expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal('Alkamispäivä : 15.8.2008 — Päättymispäivä : 4.6.2016\n' +
            'Tila 4.6.2016 Valmistunut\n' +
            '15.8.2008 Läsnä\n' +
            'Lisätiedot\n' +
            'Perusopetuksen aloittamista lykätty kyllä\n' +
            'Aloittanut ennen oppivelvollisuutta ei\n' +
            'Pidennetty oppivelvollisuus 15.8.2008 — 4.6.2016\n' +
            'Tukimuodot Osa-aikainen erityisopetus\n' +
            'Erityisen tuen päätös 15.8.2008 — 4.6.2016\n' +
            'Opiskelee toiminta-alueittain kyllä\n' +
            'Opiskelee erityisryhmässä kyllä\n' +
            'Tehostetun tuen päätös 15.8.2008 — 4.6.2016\n' +
            'Joustava perusopetus 15.8.2008 — 4.6.2016\n' +
            'Kotiopetus 15.8.2008 — 4.6.2016\n' +
            'Ulkomailla 15.8.2008 — 4.6.2016\n' +
            'Vuosiluokkiin sitoutumaton opetus kyllä')
        })

        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Koulutus Peruskoulu 104/011/2014\n' +
            'Oppimäärä Aikuisten perusopetus\n' +
            'Toimipiste Jyväskylän normaalikoulu\n' +
            'Suoritustapa Erityinen tutkinto\n' +
            'Suoritus: VALMIS Vahvistus : 4.6.2016 Jyväskylä Reijo Reksi')
        })
        it('näyttää oppiaineiden arvosanat', function() {
          expect(extractAsText(S('.oppiaineet'))).to.equal('Oppiaineiden arvosanat\n' +
            'Arvostelu 4-10, S (suoritettu), H (hylätty) tai V (vapautettu)\n' +
            'Oppiaine Arvosana\n' +
            'motoriset taidot S\n' +
            'Motoriset taidot kehittyneet hyvin perusopetuksen aikana\n' +
            'kieli ja kommunikaatio S\n' +
            'sosiaaliset taidot S\n' +
            'päivittäisten toimintojen taidot S\n' +
            'kognitiiviset taidot S')
        })
      })
      describe('Tulostettava todistus', function() {
        before(opinnot.avaaTodistus(0))
        it('näytetään', function() {
          // See more detailed content specification in PerusopetusSpec.scala
          expect(todistus.vahvistus()).to.equal('Jyväskylä 4.6.2016 Reijo Reksi rehtori')
        })
      })
    })

    describe('Virhetilanteet', function() {
      describe('Todistuksen avaaminen, kun käyttäjä ei ole kirjautunut', function() {
        before(Authentication().logout, reloadTestFrame, wait.until(login.isVisible))
        it('Näytetään login-sivu', function() {
          expect(login.isVisible()).to.equal(true)
        })
      })

      describe('Todistuksen avaaminen, kun todistusta ei löydy', function() {
        before(Authentication().login(), page.openPage, openPage('/koski/1010101010', page.is404))
        it('Näytetään 404-sivu', function() {} )
      })
    })
  })

  describe('Tietojen muuttaminen', function() {
    before(page.openPage, page.oppijaHaku.searchAndSelect('220109-784L'))

    describe('Opiskeluoikeuden tiedot', function() {
      it('Alkutila', function() {
        expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(true)
        expect(opinnot.opiskeluoikeusEditor().subEditor('.property.tila').propertyBySelector('label.tila:contains("Valmistunut")').isVisible()).to.equal(false)
      })

      describe('Opiskeluoikeuden tila', function() {
        var editor = opinnot.opiskeluoikeusEditor()
        var opiskeluoikeus = OpiskeluoikeusDialog()
        before(editor.edit, editor.property('tila').removeItem(0), editor.doneEditing, wait.until(page.isSavedLabelShown))

        describe('Eronnut', function() {
          it('Alkutila', function() {
            expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
          })

          describe('Kun lisätään', function() {
            before(editor.edit, opinnot.avaaLisaysDialogi, opiskeluoikeus.tila().click('input[value="eronnut"]'), opiskeluoikeus.tallenna, editor.doneEditing)
            it('Opiskeluoikeuden päättymispäivä asetetaan', function() {
              expect(editor.property('päättymispäivä').getValue()).to.equal(currentDate)
            })

            it('Opiskeluoikeuden tilaa ei voi lisätä kun opiskeluoikeus on päättynyt', function() {
              expect(isElementVisible(S('.opiskeluoikeuden-tiedot .add-item a'))).to.equal(false)
            })
          })

          describe('Kun poistetaan', function() {
            before(editor.edit, editor.property('tila').removeItem(0), editor.doneEditing)

            it('Opiskeluoikeuden päättymispäivä poistetaan', function() {
              expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
            })

            describe('editoitaessa', function() {
              before(editor.edit)
              it('Opiskeluoikeuden tilan voi lisätä', function() {
                expect(isElementVisible(S('.opiskeluoikeuden-tiedot .add-item a'))).to.equal(true)
              })
              after(editor.doneEditing)
            })

          })
        })

        describe('Valmistunut', function() {
          it('Alkutila', function() {
            expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
          })

          describe('Kun lisätään', function() {
            before(editor.edit, opinnot.avaaLisaysDialogi, opiskeluoikeus.tila().click('input[value="valmistunut"]'), opiskeluoikeus.tallenna, editor.doneEditing)

            it('Opiskeluoikeuden päättymispäivä asetetaan', function() {
              expect(editor.property('päättymispäivä').getValue()).to.equal(currentDate)
            })


            describe('editoitaessa', function() {
              before(editor.edit)
              it('Opiskeluoikeuden tilaa ei voi lisätä kun opiskeluoikeus on päättynyt', function() {
                expect(isElementVisible(S('.opiskeluoikeuden-tiedot .add-item a'))).to.equal(false)
              })
              after(editor.doneEditing)
            })

          })

          describe('Kun poistetaan', function() {
            before(editor.edit, editor.property('tila').removeItem(0), editor.doneEditing)

            it('Opiskeluoikeuden päättymispäivä poistetaan', function() {
              expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
            })

            describe('editoitaessa', function() {
              before(editor.edit)
              it('Opiskeluoikeuden tilan voi lisätä', function() {
                expect(isElementVisible(S('.opiskeluoikeuden-tiedot .add-item a'))).to.equal(true)
              })
              after(editor.doneEditing)
            })
          })
        })

        describe('Katsotaan eronneeksi', function() {
          before(editor.edit)
          it('Alkutila', function() {
            expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
          })

          describe('Kun lisätään', function() {
            before(opinnot.avaaLisaysDialogi, opiskeluoikeus.tila().click('input[value="katsotaaneronneeksi"]'), opiskeluoikeus.tallenna, editor.doneEditing, wait.until(page.isSavedLabelShown))

            it('Opiskeluoikeuden päättymispäivä asetetaan', function() {
              expect(editor.property('päättymispäivä').getValue()).to.equal(currentDate)
            })

            it('Opiskeluoikeuden tilaa ei voi lisätä kun opiskeluoikeus on päättynyt', function() {
              expect(isElementVisible(S('.opiskeluoikeuden-tiedot .add-item a'))).to.equal(false)
            })
          })

          describe('Kun poistetaan', function() {
            before(editor.edit, editor.property('tila').removeItem(0), editor.doneEditing)

            it('Opiskeluoikeuden päättymispäivä poistetaan', function() {
              expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
            })
          })
        })

        describe('Läsnä', function() {
          it('Alkutila', function() {
            expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
          })
          describe('Kun lisätään', function() {
            before(editor.edit, opinnot.avaaLisaysDialogi, opiskeluoikeus.tila().click('input[value="lasna"]'), opiskeluoikeus.tallenna, editor.doneEditing)

            it('Opiskeluoikeuden päättymispäivää ei aseteta', function() {
              expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
            })

            describe('editoitaessa', function() {
              before(editor.edit)
              it('Opiskeluoikeuden tilan voi lisätä', function() {
                expect(isElementVisible(S('.opiskeluoikeuden-tiedot .add-item a'))).to.equal(true)
              })
              after(editor.doneEditing)
            })
          })
        })

        describe('Väliaikaisesti keskeytynyt', function() {
          it('Alkutila', function() {
            expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
          })
          describe('Kun lisätään', function() {
            before(editor.edit, opinnot.avaaLisaysDialogi, opiskeluoikeus.tila().click('input[value="valiaikaisestikeskeytynyt"]'), opiskeluoikeus.tallenna, editor.doneEditing)

            it('Opiskeluoikeuden päättymispäivää ei aseteta', function() {
              expect(opinnot.opiskeluoikeusEditor().property('päättymispäivä').isVisible()).to.equal(false)
            })
          })
        })

        describe('Virheellinen päivämäärä', function() {
          before(editor.edit, opinnot.avaaLisaysDialogi, opiskeluoikeus.tila().click('input[value="eronnut"]'), opiskeluoikeus.alkuPaiva().setValue('11.1.200'))
          it('Tallennus on estetty', function() {
            expect(opiskeluoikeus.isEnabled()).to.equal(false)
          })
        })

        describe('Virheellinen päivämäärä ja tilan muutos', function() {
          before(editor.edit, opinnot.avaaLisaysDialogi, opiskeluoikeus.tila().click('input[value="eronnut"]'), opiskeluoikeus.alkuPaiva().setValue('11.1.200'), opiskeluoikeus.tila().click('input[value="valmistunut"]'))
          it('Tallennus on estetty', function() {
            expect(opiskeluoikeus.isEnabled()).to.equal(false)
          })
        })

        describe('Uusi alkupäivä on aikaisempi kuin viimeisen tilan alkupäivämäärä', function() {
          before(editor.edit, opinnot.avaaLisaysDialogi, opiskeluoikeus.tila().click('input[value="eronnut"]'), opiskeluoikeus.alkuPaiva().setValue('14.8.2008'))
          it('Tallennus on estetty', function() {
            expect(opiskeluoikeus.isEnabled()).to.equal(false)
          })
        })

        describe('Virheellinen päivämäärä korjattu oikeelliseksi', function() {
          before(editor.edit, opinnot.avaaLisaysDialogi, opiskeluoikeus.tila().click('input[value="eronnut"]'), opiskeluoikeus.alkuPaiva().setValue('11.1.200'), opiskeluoikeus.alkuPaiva().setValue(currentDate))
          it('Tallennus on sallittu', function() {
            expect(opiskeluoikeus.isEnabled()).to.equal(true)
          })
          after(editor.doneEditing, wait.until(page.isSavedLabelShown))
        })
      })

      describe('Kun lisätään opiskeluoikeuden lisätiedot', function() {
        var editor = opinnot.opiskeluoikeusEditor()
        before(editor.edit, opinnot.expandAll, editor.property('perusopetuksenAloittamistaLykätty').setValue(true), editor.doneEditing, wait.until(page.isSavedLabelShown))
        it('Toimii', function() {
          expect(editor.property('perusopetuksenAloittamistaLykätty').getValue()).to.equal('kyllä')
        })

        describe("Kun lisätiedot piilotetaan ja näytetään uudestaan", function() {
          before(opinnot.collapseAll, opinnot.expandAll)
          it('Toimii', function() {
            expect(editor.property('perusopetuksenAloittamistaLykätty').getValue()).to.equal('kyllä')
          })
        })

        describe("Kun lisätiedot piilotetaan, siirrytään muokkaukseen, avataan lisätiedot, poistutaan muokkauksesta", function() {
          before(opinnot.collapseAll, editor.edit, opinnot.expandAll, editor.doneEditing)
          it('Toimii', function() {
            expect(editor.property('perusopetuksenAloittamistaLykätty').getValue()).to.equal('kyllä')
          })
        })

        describe('Validi päivämääräväli', function() {
          var pidennettyOppivelvollisuus = editor.property('pidennettyOppivelvollisuus').toPäivämääräväli()
          before(editor.edit, opinnot.expandAll, pidennettyOppivelvollisuus.setAlku(currentDate), editor.doneEditing, wait.until(page.isSavedLabelShown))
          it('Tallennus onnistuu', function() {
            expect(pidennettyOppivelvollisuus.getAlku()).to.equal(currentDate)
          })
        })

        describe('Virheellinen päivämääräväli', function() {
          var pidennettyOppivelvollisuus = editor.property('pidennettyOppivelvollisuus').toPäivämääräväli()
          before(editor.edit, opinnot.expandAll, pidennettyOppivelvollisuus.setAlku(currentDate), pidennettyOppivelvollisuus.setLoppu('1.2.2008'))
          it('Estää tallennuksen', function() {
            expect(pidennettyOppivelvollisuus.isValid()).to.equal(false)
            expect(opinnot.onTallennettavissa()).to.equal(false)
          })
          after(pidennettyOppivelvollisuus.setLoppu(currentDate), editor.doneEditing, wait.until(page.isSavedLabelShown))
        })
      })
    })

    describe('Suoritusten tiedot', function() {
      describe('Suorituskielen lisäys', function() {
        var editor = opinnot.suoritusEditor()
        before(opinnot.valitseSuoritus('Peruskoulu'), editor.edit, editor.property('suorituskieli').addValue, editor.doneEditing, wait.until(page.isSavedLabelShown))
        it('muutettu suorituskieli näytetään', function() {
          expect(editor.property('suorituskieli').getValue()).to.equal('suomi')
        })
      })
      describe('Todistuksella näkyvien lisätietojen lisäys', function() {
        var editor = opinnot.suoritusEditor()
        var lisätiedot = editor.property('todistuksellaNäkyvätLisätiedot')
        before(opinnot.valitseSuoritus('Peruskoulu'), editor.edit, lisätiedot.addValue, lisätiedot.setValue("Testitesti"), editor.doneEditing, wait.until(page.isSavedLabelShown))
        it('Uudet lisätiedot näytetään', function() {
          expect(lisätiedot.getValue()).to.equal('Testitesti')
        })
      })
      describe('Oppiaineen laajuuden muutos', function() {
        var editor = opinnot.suoritusEditor()
        before(editor.edit, editor.property('laajuus').setValue('2'), editor.doneEditing, wait.until(page.isSavedLabelShown))
        it('muutettu laajuus näytetään', function() {
          expect(editor.property('laajuus').getValue()).to.equal('2')
        })
      })
      describe('Oppiaineen arvosanan muutos', function() {
        var editor = opinnot.suoritusEditor()
        var äidinkieli = editor.subEditor('.oppiaineet tbody:eq(0) tr:eq(0)')
        var arvosana = äidinkieli.propertyBySelector('.arvosana')
        before(opinnot.valitseSuoritus('7. vuosiluokka'), editor.edit, arvosana.setValue('5'), editor.doneEditing)
        it('muutettu arvosana näytetään', function() {
          expect(arvosana.getValue()).to.equal('5')
        })
      })
      describe('Käyttäytymisen arvioinnin lisäys', function() {
        var editor = opinnot.suoritusEditor()
        var arvosana = editor.subEditor('.kayttaytyminen').property('arvosana')
        before(opinnot.valitseSuoritus('7. vuosiluokka'), editor.edit, editor.propertyBySelector('.kayttaytyminen').addValue, editor.doneEditing)
        describe('Muuttamatta arviointia', function() {
          it('Näyttää oletusarvon S', function() {
            expect(arvosana.getValue()).to.equal('S')
          })
        })
        describe('Kun muutetaan arvosanaa', function() {
          before(editor.edit, arvosana.setValue('10'), editor.doneEditing)
          it('Näyttää muutetun arvon', function() {
            expect(arvosana.getValue()).to.equal('10')
          })
        })
        describe('Kun lisätään sanallinen kuvaus', function() {
          var kuvaus = editor.subEditor('.kayttaytyminen').property('kuvaus')
          before(editor.edit, kuvaus.addValue, kuvaus.setValue('Hyvää käytöstä'), editor.doneEditing)
          it('Näyttää muutetun arvon', function() {
            expect(kuvaus.getValue()).to.equal('Hyvää käytöstä')
          })
        })
      })
      describe('Liitetiedot', function() {
        // Liitetiedot testataan isolla testisetillä, joilla varmistetaan ArrayEditorin toiminta
        var editor = opinnot.suoritusEditor()
        var liitetiedot = editor.property('liitetiedot')
        describe('Liitetietojen lisäys', function() {
          before(opinnot.valitseSuoritus('7. vuosiluokka'), editor.edit, liitetiedot.addValue, liitetiedot.property('kuvaus').setValue('TestiTesti'))
          it('Editoinnin aikana ei näytetä ylimääräistä poistonappia', function() {
            expect(liitetiedot.isRemoveValueVisible()).to.equal(false)
          })
          describe('Lisäyksen jälkeen', function() {
            before(editor.doneEditing)
            it('Näyttää uudet liitetiedot', function() {
              expect(liitetiedot.getText()).to.equal('Liitetiedot Tunniste Käyttäytyminen\nKuvaus TestiTesti')
            })
            describe('Toisen liitetiedon lisäys', function() {
              before(editor.edit, liitetiedot.addItem, liitetiedot.itemEditor(1).property('kuvaus').setValue('Testi2'), editor.doneEditing)
              it('Näyttää uudet liitetiedot', function() {
                expect(liitetiedot.getText()).to.equal('Liitetiedot Tunniste Käyttäytyminen\nKuvaus TestiTesti\nTunniste Käyttäytyminen\nKuvaus Testi2')
              })
              describe('Ensimmäisen liitetiedon poisto', function() {
                before(editor.edit, liitetiedot.removeItem(0), editor.doneEditing)
                it('Näyttää vain toisen lisätiedon', function() {
                  expect(liitetiedot.getText()).to.equal('Liitetiedot Tunniste Käyttäytyminen\nKuvaus Testi2')
                })
                describe('Lisäys ja poisto samalla kertaa', function() {
                  before(editor.edit, liitetiedot.addItem, liitetiedot.itemEditor(1).property('kuvaus').setValue('Testi3'), liitetiedot.removeItem(0))
                  it('Välitulos: poisto toimii editoitaessa', function() {
                    expect(liitetiedot.itemEditor(0).property('kuvaus').getValue()).to.equal('Testi3')
                  })
                  describe('Editoinnin jälkeen', function() {
                    before(editor.doneEditing)
                    it('Näyttää oikeellisesti vain toisen lisätiedon', function() {
                      expect(liitetiedot.getText()).to.equal('Liitetiedot Tunniste Käyttäytyminen\nKuvaus Testi3')
                    })

                    describe('Viimeisen alkion poisto', function() {
                      before(editor.edit, liitetiedot.removeItem(0))
                      it('Välitulos: poisto toimii editoitaessa', function() {
                        expect(liitetiedot.getItems().length).to.equal(0)
                      })
                      describe('poiston jälkeen', function() {
                        before(editor.doneEditing)
                        it('Näytetään tyhjät liitetiedot', function() {
                          expect(liitetiedot.isVisible()).to.equal(false)
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
        describe('Useamman liitetiedon poisto kerralla', function() {
          before(page.oppijaHaku.searchAndSelect('220109-784L'), opinnot.valitseSuoritus('7. vuosiluokka'),
            editor.edit,
            liitetiedot.addValue, liitetiedot.itemEditor(0).property('kuvaus').setValue('T1'),
            liitetiedot.addItem, liitetiedot.itemEditor(1).property('kuvaus').setValue('T2'),
            editor.doneEditing,
            editor.edit,
            liitetiedot.removeItem(0),
            liitetiedot.removeItem(0),
            editor.doneEditing
          )

          it('Kaikki liitetiedot on poistettu', function() {
            expect(liitetiedot.isVisible()).to.equal(false)
          })
        })
      })
    })

    describe('Valmis tilaa ei voi lisätä kun suoritus on kesken', function() {
      before(page.openPage, page.oppijaHaku.searchAndSelect('160932-311V'), opinnot.opiskeluoikeusEditor().edit, opinnot.avaaLisaysDialogi)

      it('Tallennus on estetty', function() {
        expect(OpiskeluoikeusDialog().radioEnabled('valmistunut')).to.equal(false)
      })
    })

    describe('Kun tiedot ovat peräisin ulkoisesta järjestelmästä', function() {
      before(page.openPage, page.oppijaHaku.searchAndSelect('010675-9981'))
      it('Muutokset estetty', function() {
        expect(opinnot.anythingEditable()).to.equal(false)
      })
    })

    describe('Kun käyttäjällä ei ole kirjoitusoikeuksia', function() {
      before(Authentication().logout, Authentication().login('omnia-katselija'), page.openPage, page.oppijaHaku.searchAndSelect('080154-770R'))
      it('Muutokset estetty', function() {
        var suoritus = opinnot.suoritusEditor()
        expect(suoritus.isEditable()).to.equal(false)
      })
    })
  })

  describe('Opiskeluoikeuden lisääminen', function() {
    var addOppija = AddOppijaPage()

    describe('Uudelle henkilölle', function() {
      before(prepareForNewOppija('kalle', '230872-7258'))

      describe('Aluksi', function() {
        it('Lisää-nappi on disabloitu', function() {
          expect(addOppija.isEnabled()).to.equal(false)
        })
      })

      describe('Kun syötetään validit tiedot', function() {
        before(addOppija.enterValidDataPerusopetus())

        describe('Käyttöliittymän tila', function() {
          it('Lisää-nappi on enabloitu', function() {
            expect(addOppija.isEnabled()).to.equal(true)
          })
          it('Vain yksi opiskeluoikeuden tyypin valinta näytetään', function() {
            expect(addOppija.opiskeluoikeudenTyypit()).to.deep.equal(['Perusopetus'])
          })
        })

        describe('Kun painetaan Lisää-nappia', function() {
          before(addOppija.submitAndExpectSuccess('Tyhjä, Tero (230872-7258)', 'Peruskoulu'))

          it('lisätty oppija näytetään', function() {})

          it('Lisätty opiskeluoikeus näytetään', function() {
            expect(opinnot.getTutkinto()).to.equal('Peruskoulu')
            expect(opinnot.getOppilaitos()).to.equal('Jyväskylän normaalikoulu')
          })
        })
      })

      describe('Kun oppilaitos mahdollisesti tarjoaa myös ammatillista koulutusta', function() {
        before(
          resetFixtures,
          prepareForNewOppija('kalle', '230872-7258'),
          addOppija.enterValidDataPerusopetus({oppilaitos:'Helsingin medialukio'}))

        it('Opiskeluoikeuden tyypin valinnassa näytetään myös ammatillinen koulutus', function() {
          expect(addOppija.opiskeluoikeudenTyypit()).to.deep.equal(['Ammatillinen koulutus', 'Perusopetus'])
        })

        describe('Opiskeluoikeuden lisäys', function() {
          before(addOppija.selectOpiskeluoikeudenTyyppi('perusopetus'),
                 addOppija.submitAndExpectSuccess('Tyhjä, Tero (230872-7258)', 'Peruskoulu'))

          it('lisätty oppija näytetään', function() {})
        })
      })
    })
  })
  describe('Perusopetuksen oppiaineen oppimäärän suoritus', function() {
    before(Authentication().login(), page.openPage, page.oppijaHaku.searchAndSelect('110738-839L'))
    describe('Kaikki tiedot näkyvissä', function() {
      before(opinnot.expandAll)
      it('näyttää opiskeluoikeuden tiedot', function() {
        expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
          'Alkamispäivä : 15.8.2008 — Päättymispäivä : 4.6.2016\n' +
          'Tila 4.6.2016 Valmistunut\n' +
          '15.8.2008 Läsnä')
      })

      it('näyttää suorituksen tiedot', function() {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Oppiaine Äidinkieli ja kirjallisuus\n' +
          'Kieli Suomen kieli ja kirjallisuus\n' +
          'Yksilöllistetty oppimäärä ei\n' +
          'Painotettu opetus ei\n' +
          'Toimipiste Jyväskylän normaalikoulu\n' +
          'Arvosana 9\n' +
          'Suoritustapa Erityinen tutkinto\n' +
          'Suoritus: VALMIS Vahvistus : 4.6.2016 Jyväskylä Reijo Reksi')
      })
    })
    describe('Tulostettava todistus', function() {
      before(opinnot.avaaTodistus(0))
      it('näytetään', function() {
        expect(todistus.headings()).to.equal('Jyväskylän yliopisto Todistus perusopetuksen oppiaineen oppimäärän suorittamisesta Jyväskylän normaalikoulu Oppiaineenkorottaja, Olli 110738-839L')
        expect(todistus.arvosanarivi('.oppiaine.AI')).to.equal('Äidinkieli ja kirjallisuus Kiitettävä 9')
        expect(todistus.arvosanarivi('.muut-opinnot')).to.equal('')
      })
    })
  })

  describe('Perusopetuksen lisäopetus', function() {
    before(page.openPage, page.oppijaHaku.searchAndSelect('131025-6573'))
    describe('Kaikki tiedot näkyvissä', function() {
      before(opinnot.expandAll)

      it('näyttää opiskeluoikeuden tiedot', function() {
        expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal('Alkamispäivä : 15.8.2008 — Päättymispäivä : 4.6.2016\n' +
          'Tila 4.6.2016 Valmistunut\n' +
          '15.8.2008 Läsnä\n' +
          'Lisätiedot\n' +
          'Pidennetty oppivelvollisuus 15.8.2008 — 4.6.2016')
      })

      it('näyttää suorituksen tiedot', function() {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Koulutus Perusopetuksen lisäopetus\n' +
          'Toimipiste Jyväskylän normaalikoulu\n' +
          'Suoritus: VALMIS Vahvistus : 4.6.2016 Jyväskylä Reijo Reksi')
      })
      it('näyttää oppiaineiden arvosanat', function() {
        expect(extractAsText(S('.oppiaineet'))).to.equal('Oppiaineiden arvosanat\n' +
          'Arvostelu 4-10, S (suoritettu), H (hylätty) tai V (vapautettu)\n' +
          'Pakolliset oppiaineet\n' +
          'Oppiaine Arvosana\n' +
          'Äidinkieli ja kirjallisuus 7 †\n' +
          'A1-kieli, englanti 10 †\n' +
          'B1-kieli, ruotsi 6 †\n' +
          'Matematiikka 6 †\n' +
          'Biologia 10 †\n' +
          'Maantieto 9 †\n' +
          'Fysiikka 8 †\n' +
          'Kemia 9 †\n' +
          'Terveystieto 8 †\n' +
          'Historia 7\n' +
          'Yhteiskuntaoppi 8 †\n' +
          'Kuvataide 8\n' +
          'Liikunta 7 * †\n' +
          'Valinnaiset oppiaineet\n' +
          'Oppiaine Arvosana\n' +
          'Monialainen oppimiskokonaisuus S\n' +
          '† = perusopetuksen päättötodistuksen arvosanan korotus, * = yksilöllistetty oppimäärä')
      })
    })
    describe('Tulostettava todistus', function() {
      before(opinnot.avaaTodistus(0))
      it('näytetään', function() {
        expect(todistus.headings()).to.equal('Jyväskylän yliopisto Todistus lisäopetuksen suorittamisesta Jyväskylän normaalikoulu Kymppiluokkalainen, Kaisa 131025-6573')
        // See more detailed content specification in PerusopetusSpec.scala
      })
    })
  })

  describe('Perusopetukseen valmistava opetus', function() {
    before(page.openPage, page.oppijaHaku.searchAndSelect('220109-784L'), opinnot.valitseOpiskeluoikeudenTyyppi('perusopetukseenvalmistavaopetus'))
    describe('Kaikki tiedot näkyvissä', function() {
      before(opinnot.expandAll)
      it('näyttää opiskeluoikeuden tiedot', function() {
        expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
          'Alkamispäivä : 15.8.2007 — Päättymispäivä : 1.6.2008\n' +
          'Tila 1.6.2008 Valmistunut\n' +
          '15.8.2007 Läsnä')
      })
      it('näyttää suorituksen tiedot', function() {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Koulutus Perusopetukseen valmistava opetus\n' +
          'Toimipiste Jyväskylän normaalikoulu\n' +
          'Suoritus: VALMIS Vahvistus : 4.6.2016 Jyväskylä Reijo Reksi')
      })
      it('näyttää oppiaineiden arvosanat', function() {
        expect(extractAsText(S('.oppiaineet'))).to.equal(
          'Oppiaineiden arvosanat\n' +
          'Arvostelu 4-10, S (suoritettu), H (hylätty) tai V (vapautettu)\n' +
          'Oppiaine Arvosana Laajuus\n' +
          'Äidinkieli S 10 vuosiviikkotuntia\n' +
          'Keskustelee sujuvasti suomeksi')
      })
    })
    describe('Tulostettava todistus', function() {
      before(opinnot.avaaTodistus(0))
      it('näytetään', function() {
        expect(todistus.vahvistus()).to.equal('Jyväskylä 4.6.2016 Reijo Reksi rehtori')
        // See more detailed content specification in PerusopetusSpec.scala
      })
    })
  })
})