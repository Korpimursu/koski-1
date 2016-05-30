describe('Lukiokoulutus', function( ){
  var page = KoskiPage()
  var todistus = TodistusPage()
  before(resetFixtures, Authentication().login())

  describe('Lukion päättötodistus', function() {
    before(page.openPage, page.oppijaHaku.search('110496-9369', page.isOppijaSelected('Liisa')))
    describe('Oppijan suorituksissa', function() {
      it('näytetään', function() {
        expect(OpinnotPage().getTutkinto()).to.equal("Ylioppilastutkinto")
        expect(OpinnotPage().getOppilaitos()).to.equal("Jyväskylän normaalikoulu")
      })
    })
    describe('Tulostettava todistus', function() {
      before(OpinnotPage().avaaTodistus)
      it('näytetään', function() {
        // See more detailed content specification in LukioSpec.scala
        expect(todistus.vahvistus()).to.equal('Jyväskylä 4.6.2016 Reijo Reksi rehtori')
      })
    })
  })

  describe('Opintosuoritusote', function() {
    before(page.openPage, page.oppijaHaku.search('110496-9369', page.isOppijaSelected('Liisa')))
    before(OpinnotPage().avaaOpintosuoritusote(1))

    describe('Kun klikataan linkkiä', function() {
      it('näytetään', function() {
      })
    })
  })
})