package fi.oph.koski.schema

import fi.oph.koski.editor.EditorModelSerializer
import fi.oph.koski.json.Json
import fi.oph.koski.localization.{English, Finnish, LocalizedString, Swedish}
import org.json4s._
import org.json4s.reflect.{Reflector, TypeInfo}

object Deserializers {
  val deserializers = List(
    ArviointiSerializer,
    HenkilövahvistusSerializer,
    LocalizedStringDeserializer,
    OpiskeluoikeusDeserializer,
    AmmatillisenTutkinnonOsaDeserializer,
    ValtakunnallinenTutkinnonOsaDeserializer,
    AmmatillisenTutkinnonOsanOsaAlueDeserializer,
    HenkilöDeserialializer,
    JärjestämismuotoDeserializer,
    OrganisaatioDeserializer,
    LukionOppiaineDeserializer,
    IBOppiaineDeserializer,
    PreIBOppiaineDeserializer,
    PerusopetuksenOppiaineDeserializer,
    LukionKurssiDeserializer,
    PreIBKurssiDeserializer,
    SuoritusDeserializer,
    EditorModelSerializer,
    AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsaDeserializer,
    TyöhönJaItsenäiseenElämäänValmentavanKoulutuksenOsaDeserializer,
    NäyttötutkintoonValmistavanKoulutuksenOsaDeserializer,
    KoodiViiteDeserializer
  )
}

object KoodiViiteDeserializer extends Deserializer[KoodiViite] {
  private val KoodiViiteClass = classOf[KoodiViite]
  override def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), KoodiViite] =  {
    case (TypeInfo(KoodiViiteClass, _), json) =>
      json match {
        case viite: JObject => viite.extract[Koodistokoodiviite]
      }
  }
}

object SuoritusDeserializer extends Deserializer[Suoritus] {

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), Suoritus] = {
    case (TypeInfo(c, _), json: JObject) if classOf[Suoritus].isAssignableFrom(c) && c.isInterface =>
      json match {
        case suoritus: JObject if tyyppi(suoritus) == JString("ammatillinentutkinto") => suoritus.extract[AmmatillisenTutkinnonSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("ammatillinentutkintoosittainen") => suoritus.extract[AmmatillisenTutkinnonOsittainenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("ammatillisentutkinnonosa") =>
          if (ValtakunnallinenTutkinnonOsaDeserializer.isYhteinenTutkinnonOsa(suoritus \ "koulutusmoduuli")) {
            suoritus.extract[YhteisenAmmatillisenTutkinnonOsanSuoritus]
          } else {
            suoritus.extract[MuunAmmatillisenTutkinnonOsanSuoritus]
          }
        case suoritus: JObject if tyyppi(suoritus) == JString("ammatillisentutkinnonosanosaalue") => suoritus.extract[AmmatillisenTutkinnonOsanOsaAlueenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("ammatillisentutkinnonosaapienempikokonaisuus") => suoritus.extract[AmmatillisenTutkinnonOsaaPienemmänKokonaisuudenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("nayttotutkintoonvalmistavakoulutus") => suoritus.extract[NäyttötutkintoonValmistavanKoulutuksenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("nayttotutkintoonvalmistavankoulutuksenosa") => suoritus.extract[NäyttötutkintoonValmistavanKoulutuksenOsanSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("esiopetuksensuoritus") => suoritus.extract[EsiopetuksenSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetuksenoppimaara") => suoritus.extract[PerusopetuksenOppimääränSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetuksenoppiaine") => suoritus.extract[PerusopetuksenOppiaineenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetuksentoimintaalue") => suoritus.extract[PerusopetuksenToiminta_AlueenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetuksenoppiaineenoppimaara") => suoritus.extract[PerusopetuksenOppiaineenOppimääränSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetuksenvuosiluokka") => suoritus.extract[PerusopetuksenVuosiluokanSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetukseenvalmistavaopetus") => suoritus.extract[PerusopetukseenValmistavanOpetuksenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetukseenvalmistavanopetuksenoppiaine") => suoritus.extract[PerusopetukseenValmistavanOpetuksenOppiaineenSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("lukionoppimaara") => suoritus.extract[LukionOppimääränSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("lukionoppiaineenoppimaara") => suoritus.extract[LukionOppiaineenOppimääränSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("lukionoppiaine") => suoritus.extract[LukionOppiaineenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("lukionkurssi") => suoritus.extract[LukionKurssinSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("lukionmuuopinto") => suoritus.extract[MuidenLukioOpintojenSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("ibtutkinto") => suoritus.extract[IBTutkinnonSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("preiboppimaara") => suoritus.extract[PreIBSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("iboppiaine") => suoritus.extract[IBOppiaineenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("iboppiainecas") => suoritus.extract[IBCASSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("iboppiaineee") => suoritus.extract[IBExtendedEssaySuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("iboppiainetok") => suoritus.extract[IBTheoryOfKnowledgeSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("preiboppiaine") => suoritus.extract[PreIBOppiaineenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("ibkurssi") => suoritus.extract[IBKurssinSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("preibkurssi") => suoritus.extract[PreIBKurssinSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("ylioppilastutkinto") => suoritus.extract[YlioppilastutkinnonSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("ylioppilastutkinnonkoe") => suoritus.extract[YlioppilastutkinnonKokeenSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("korkeakoulututkinto") => suoritus.extract[KorkeakoulututkinnonSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("korkeakoulunopintojakso") => suoritus.extract[KorkeakoulunOpintojaksonSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("telma") => suoritus.extract[TyöhönJaItsenäiseenElämäänValmentavanKoulutuksenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("telmakoulutuksenosa") => suoritus.extract[TyöhönJaItsenäiseenElämäänValmentavanKoulutuksenOsanSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("valma") => suoritus.extract[AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("valmakoulutuksenosa") => suoritus.extract[AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsanSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("luva") => suoritus.extract[LukioonValmistavanKoulutuksenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("luvakurssi") => suoritus.extract[LukioonValmistavanKurssinSuoritus]

        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetuksenlisaopetus") => suoritus.extract[PerusopetuksenLisäopetuksenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetuksenlisaopetuksenoppiaine") => suoritus.extract[PerusopetuksenLisäopetuksenOppiaineenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("perusopetuksenlisaopetuksentoimintaalue") => suoritus.extract[PerusopetuksenLisäopetuksenToiminta_AlueenSuoritus]
        case suoritus: JObject if tyyppi(suoritus) == JString("muuperusopetuksenlisaopetuksensuoritus") => suoritus.extract[MuuPerusopetuksenLisäopetuksenSuoritus]
        case _ => throw CannotDeserializeException(this, json)
      }
  }

  private def tyyppi(suoritus: JObject) = {
    suoritus \ "tyyppi" \ "koodiarvo"
  }
}

object ArviointiSerializer extends Serializer[Arviointi] {
  object KorkeakoulunArviointiDeserializer extends Deserializer[KorkeakoulunArviointi] {
    private val ArviointiClass = classOf[KorkeakoulunArviointi]

    def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), KorkeakoulunArviointi] = {
      case (TypeInfo(ArviointiClass, _), json) =>
        json match {
          case arviointi: JObject if arviointi \ "arvosana" \ "koodistoUri" == JString("virtaarvosana") => arviointi.extract[KorkeakoulunKoodistostaLöytyväArviointi]
          case arviointi: JObject => arviointi.extract[KorkeakoulunPaikallinenArviointi]
          case _ => throw CannotDeserializeException(this, json)
        }
    }
  }

  object PerusopetuksenOppiaineenArviointiDeserializer extends Deserializer[PerusopetuksenOppiaineenArviointi] {
    private val PerusopetuksenOppiaineenArviointiClass = classOf[PerusopetuksenOppiaineenArviointi]

    def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), PerusopetuksenOppiaineenArviointi] = {
      case (TypeInfo(PerusopetuksenOppiaineenArviointiClass, _), json) =>
        json match {
          case arviointi: JObject if (List(JString("S"), JString("H")).contains(arviointi \ "arvosana" \ "koodiarvo")) => arviointi.extract[SanallinenPerusopetuksenOppiaineenArviointi]
          case arviointi: JObject => arviointi.extract[NumeerinenPerusopetuksenOppiaineenArviointi]
        }
    }
  }

  object LukionKurssinArviointiDeserializer extends Deserializer[LukionKurssinArviointi] {
    private val LukionKurssinArviointiClass = classOf[LukionKurssinArviointi]

    def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), LukionKurssinArviointi] = {
      case (TypeInfo(LukionKurssinArviointiClass, _), json) =>
        json match {
          case arviointi: JObject if (List(JString("S"), JString("H")).contains(arviointi \ "arvosana" \ "koodiarvo")) => arviointi.extract[SanallinenLukionKurssinArviointi]
          case arviointi: JObject => arviointi.extract[NumeerinenLukionKurssinArviointi]
        }
    }
  }


  override def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), Arviointi] = {
    case (TypeInfo(c, _), json: JObject) if classOf[Arviointi].isAssignableFrom(c) =>
      Extraction.extract(json, Reflector.scalaTypeOf(c))(format - ArviointiSerializer + KorkeakoulunArviointiDeserializer + PerusopetuksenOppiaineenArviointiDeserializer + LukionKurssinArviointiDeserializer).asInstanceOf[Arviointi]
  }

  override def serialize(implicit format: Formats): PartialFunction[Any, JValue] = {
    case (a: Arviointi) =>
      val json = Extraction.decompose(a)(format - ArviointiSerializer).asInstanceOf[JObject]
      if (!json.values.contains("hyväksytty")) {
        json.merge(JObject("hyväksytty" -> JBool(a.hyväksytty)))
      } else {
        json
      }
  }
}

object HenkilövahvistusSerializer extends Deserializer[Henkilövahvistus] {
  private val HenkilövahvistusClass = classOf[Henkilövahvistus]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), Henkilövahvistus] = {
    case (TypeInfo(HenkilövahvistusClass, _), json) =>
      json match {
        case vahvistus: JObject if vahvistus.values.contains("paikkakunta") => vahvistus.extract[HenkilövahvistusPaikkakunnalla]
        case vahvistus: JObject => vahvistus.extract[HenkilövahvistusIlmanPaikkakuntaa]
      }
  }
}

trait Deserializer[T] extends Serializer[T] {
  def serialize(implicit format: Formats): PartialFunction[Any, JValue] = PartialFunction.empty
}

object OpiskeluoikeusDeserializer extends Deserializer[Opiskeluoikeus] {
  private val OpiskeluoikeusClass = classOf[Opiskeluoikeus]
  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), Opiskeluoikeus] = {
    case (TypeInfo(OpiskeluoikeusClass, _), json) =>
      json match {
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("ammatillinenkoulutus") => oo.extract[AmmatillinenOpiskeluoikeus]
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("esiopetus") => oo.extract[EsiopetuksenOpiskeluoikeus]
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("perusopetus") => oo.extract[PerusopetuksenOpiskeluoikeus]
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("perusopetuksenlisaopetus") => oo.extract[PerusopetuksenLisäopetuksenOpiskeluoikeus]
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("perusopetukseenvalmistavaopetus") => oo.extract[PerusopetukseenValmistavanOpetuksenOpiskeluoikeus]
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("luva") => oo.extract[LukioonValmistavanKoulutuksenOpiskeluoikeus]
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("lukiokoulutus") => oo.extract[LukionOpiskeluoikeus]
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("ibtutkinto") => oo.extract[IBOpiskeluoikeus]
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("korkeakoulutus") => oo.extract[KorkeakoulunOpiskeluoikeus]
        case oo: JObject if oo \ "tyyppi" \ "koodiarvo" == JString("ylioppilastutkinto") => oo.extract[YlioppilastutkinnonOpiskeluoikeus]
        case _ => throw CannotDeserializeException(this, json)
      }
  }
}

object NäyttötutkintoonValmistavanKoulutuksenOsaDeserializer extends Deserializer[NäyttötutkintoonValmistavanKoulutuksenOsa] {
  private val NäyttötutkintoonValmistavanKoulutuksenOsaClass = classOf[NäyttötutkintoonValmistavanKoulutuksenOsa]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), NäyttötutkintoonValmistavanKoulutuksenOsa] = {
    case (TypeInfo(NäyttötutkintoonValmistavanKoulutuksenOsaClass, _), json) =>
      json match {
        case moduuli: JObject if moduuli \ "tunniste" \ "koodistoUri" == JString("tutkinnonosat") => moduuli.extract[ValtakunnallinenTutkinnonOsa]
        case moduuli: JObject => moduuli.extract[PaikallinenNäyttötutkintoonValmistavanKoulutuksenOsa]
      }
  }
}

object AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsaDeserializer extends Deserializer[AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsa] {
  private val AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsaClass = classOf[AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsa]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsa] = {
    case (TypeInfo(AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsaClass, _), json) =>
      json match {
        case moduuli: JObject if moduuli \ "tunniste" \ "koodistoUri" == JString("tutkinnonosat") => moduuli.extract[ValtakunnallinenTutkinnonOsa]
        case moduuli: JObject => moduuli.extract[PaikallinenAmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsa]
      }
  }
}

object TyöhönJaItsenäiseenElämäänValmentavanKoulutuksenOsaDeserializer extends Deserializer[TyöhönJaItsenäiseenElämäänValmentavanKoulutuksenOsa] {
  private val TyöhönJaItsenäiseenElämäänValmentavanKoulutuksenOsaClass = classOf[TyöhönJaItsenäiseenElämäänValmentavanKoulutuksenOsa]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), TyöhönJaItsenäiseenElämäänValmentavanKoulutuksenOsa] = {
    case (TypeInfo(TyöhönJaItsenäiseenElämäänValmentavanKoulutuksenOsaClass, _), json) =>
      json match {
        case moduuli: JObject if moduuli \ "tunniste" \ "koodistoUri" == JString("tutkinnonosat") => moduuli.extract[ValtakunnallinenTutkinnonOsa]
        case moduuli: JObject => moduuli.extract[PaikallinenTyöhönJaItsenäiseenElämäänValmentavanKoulutuksenOsa]
      }
  }
}

object LukionOppiaineDeserializer extends Deserializer[LukionOppiaine] {
  private val LukionOppiaineClass = classOf[LukionOppiaine]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), LukionOppiaine] = {
    case (TypeInfo(LukionOppiaineClass, _), json) =>
      json match {
        case moduuli: JObject if moduuli \ "tunniste" \ "koodistoUri" == JString("koskioppiaineetyleissivistava") => json match {
          case moduuli: JObject if moduuli \ "tunniste" \ "koodiarvo" == JString("AI") => moduuli.extract[AidinkieliJaKirjallisuus]
          case moduuli: JObject if (moduuli \ "kieli").isInstanceOf[JObject] => moduuli.extract[VierasTaiToinenKotimainenKieli]
          case moduuli: JObject if (moduuli \ "oppimäärä").isInstanceOf[JObject] => moduuli.extract[LukionMatematiikka]
          case moduuli: JObject => moduuli.extract[LukionMuuValtakunnallinenOppiaine]
        }
        case moduuli: JObject => moduuli.extract[PaikallinenLukionOppiaine]
        case _ => throw CannotDeserializeException(this, json)
      }
  }
}

object PreIBOppiaineDeserializer extends Deserializer[PreIBOppiaine] {
  private val PreIBOppiaineClass = classOf[PreIBOppiaine]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), PreIBOppiaine] = {
    case (TypeInfo(PreIBOppiaineClass, _), json) =>
      json match {
        case moduuli: JObject if moduuli \ "tunniste" \ "koodistoUri" == JString("oppiaineetib") => moduuli.extract[IBAineRyhmäOppiaine]
        case moduuli: JObject => moduuli.extract[LukionOppiaine]
        case _ => throw CannotDeserializeException(this, json)
      }
  }
}

object IBOppiaineDeserializer extends Deserializer[IBAineRyhmäOppiaine] {
  private val IBOppiaineClass = classOf[IBAineRyhmäOppiaine]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), IBAineRyhmäOppiaine] = {
    case (TypeInfo(IBOppiaineClass, _), json) =>
      json match {
        case moduuli: JObject if (moduuli \ "kieli").isInstanceOf[JObject] => moduuli.extract[IBOppiaineLanguage]
        case moduuli: JObject if (moduuli \ "taso").isInstanceOf[JObject] => moduuli.extract[IBOppiaineMuu]
        case _ => throw CannotDeserializeException(this, json)
      }
  }
}

object PerusopetuksenOppiaineDeserializer extends Deserializer[PerusopetuksenOppiaine] {
  private val PerusopetuksenOppiaineClass = classOf[PerusopetuksenOppiaine]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), PerusopetuksenOppiaine] = {
    case (TypeInfo(PerusopetuksenOppiaineClass, _), json) =>
      json match {
        case moduuli: JObject if moduuli \ "tunniste" \ "koodiarvo" == JString("AI") => moduuli.extract[PeruskoulunAidinkieliJaKirjallisuus]
        case moduuli: JObject if (moduuli \ "kieli").isInstanceOf[JObject] => moduuli.extract[PeruskoulunVierasTaiToinenKotimainenKieli]
        case moduuli: JObject if moduuli \ "tunniste" \ "koodistoUri" == JString("koskioppiaineetyleissivistava") => moduuli.extract[MuuPeruskoulunOppiaine]
        case moduuli: JObject => moduuli.extract[PerusopetuksenPaikallinenValinnainenOppiaine]
        case _ => throw CannotDeserializeException(this, json)
      }
  }
}

object AmmatillisenTutkinnonOsaDeserializer extends Deserializer[AmmatillisenTutkinnonOsa] {
  private val AmmatillisenTutkinnonOsaClass = classOf[AmmatillisenTutkinnonOsa]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), AmmatillisenTutkinnonOsa] = {
    case (TypeInfo(AmmatillisenTutkinnonOsaClass, _), json) =>
      json match {
        case moduuli: JObject if moduuli \ "tunniste" \ "koodistoUri" == JString("tutkinnonosat") =>
          moduuli.extract[ValtakunnallinenTutkinnonOsa]
        case moduuli: JObject =>
          moduuli.extract[PaikallinenTutkinnonOsa]
      }
  }
}

object ValtakunnallinenTutkinnonOsaDeserializer extends Deserializer[ValtakunnallinenTutkinnonOsa] {
  private val ValtakunnallinenTutkinnonOsaClass = classOf[ValtakunnallinenTutkinnonOsa]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), ValtakunnallinenTutkinnonOsa] = {
    case (TypeInfo(ValtakunnallinenTutkinnonOsaClass, _), json) =>
      if (isYhteinenTutkinnonOsa(json)) {
        json.extract[YhteinenTutkinnonOsa]
      } else {
        json.extract[MuuValtakunnallinenTutkinnonOsa]
      }
  }

  def isYhteinenTutkinnonOsa(json: JValue)(implicit format: Formats) = {
    val koodistoUri = (json \ "tunniste" \ "koodistoUri")
    val koodiarvo = (json \ "tunniste" \ "koodiarvo")
    (koodistoUri, koodiarvo) match {
      case (JString("tutkinnonosat"), JString(koodiarvo)) if (AmmatillisenTutkinnonOsa.yhteisetTutkinnonOsat.map(_.koodiarvo).contains(koodiarvo)) => true
      case _ => false
    }
  }
}

object AmmatillisenTutkinnonOsanOsaAlueDeserializer extends Deserializer[AmmatillisenTutkinnonOsanOsaAlue] {
  private val OsaAlueClass = classOf[AmmatillisenTutkinnonOsanOsaAlue]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), AmmatillisenTutkinnonOsanOsaAlue] = {
    case (TypeInfo(OsaAlueClass, _), json: JObject) if json \ "tunniste" \ "koodistoUri" == JString("ammatillisenoppiaineet") =>
      if (json.values.contains("kieli")) {
        if (json \ "tunniste" \ "koodiarvo" == JString("AI")) {
          json.extract[AmmatillisenTutkinnonÄidinkieli]
        } else {
          json.extract[AmmatillisenTutkinnonVierasTaiToinenKotimainenKieli]
        }
      } else {
        json.extract[ValtakunnallinenAmmatillisenTutkinnonOsanOsaAlue]
      }
    case (TypeInfo(OsaAlueClass, _), json) => json.extract[PaikallinenAmmatillisenTutkinnonOsanOsaAlue]
  }
}

object LukionKurssiDeserializer extends Deserializer[LukionKurssi] {
  private val TheClass = classOf[LukionKurssi]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), LukionKurssi] = {
    case (TypeInfo(TheClass, _), json) => deserializeKurssi(format)(json)
  }

  def deserializeKurssi(implicit format: Formats): PartialFunction[JValue, LukionKurssi] = {
    case kurssi: JObject if kurssi \ "tunniste" \ "koodistoUri" == JString("lukionkurssit") => kurssi.extract[ValtakunnallinenLukionKurssi]
    case kurssi: JObject if kurssi \ "tunniste" \ "koodistoUri" == JString("lukionkurssitops2004aikuiset") => kurssi.extract[ValtakunnallinenLukionKurssi]
    case kurssi: JObject if kurssi \ "tunniste" \ "koodistoUri" == JString("lukionkurssitops2003nuoret") => kurssi.extract[ValtakunnallinenLukionKurssi]
    case kurssi: JObject if kurssi.values.contains("kurssinTyyppi") => kurssi.extract[PaikallinenLukionKurssi]
  }
}

object PreIBKurssiDeserializer extends Deserializer[PreIBKurssi] {
  private val TheClass = classOf[PreIBKurssi]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), PreIBKurssi] = {
    case (ti@TypeInfo(TheClass, _), json) =>
      LukionKurssiDeserializer.deserializeKurssi(format).applyOrElse(json, {v: JValue => v.extract[IBKurssi]})
  }
}

object HenkilöDeserialializer extends Deserializer[Henkilö] {
  private val TheClass = classOf[Henkilö]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), Henkilö] = {
    case (TypeInfo(TheClass, _), json) =>
      json match {
        case henkilö: JObject if hasOid(henkilö) && hasHetu(henkilö) => henkilö.extract[TäydellisetHenkilötiedot]
        case henkilö: JObject if hasOid(henkilö) && hasNimitiedot(henkilö) && !hasHetu(henkilö) => henkilö.extract[NimitiedotJaOid] // TODO: Used for Visma integration testing
        case henkilö: JObject if hasOid(henkilö) => henkilö.extract[OidHenkilö]
        case henkilö: JObject => henkilö.extract[UusiHenkilö]
      }
  }

  private def hasNimitiedot(henkilö: JObject) =
    henkilö.values.contains("etunimet") && henkilö.values.contains("kutsumanimi") && henkilö.values.contains("sukunimi")
  private def hasOid(henkilö: JObject): Boolean = henkilö.values.contains("oid")
  private def hasHetu(henkilö: JObject): Boolean = henkilö.values.contains("hetu")
}

object JärjestämismuotoDeserializer extends Deserializer[Järjestämismuoto] {
  private val TheClass = classOf[Järjestämismuoto]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), Järjestämismuoto] = {
    case (TypeInfo(TheClass, _), json) =>
      json match {
        case järjestämismuoto: JObject if järjestämismuoto.values.contains("oppisopimus") => järjestämismuoto.extract[OppisopimuksellinenJärjestämismuoto]
        case järjestämismuoto: JObject => järjestämismuoto.extract[JärjestämismuotoIlmanLisätietoja]
      }
  }
}

object OrganisaatioDeserializer extends Deserializer[Organisaatio] {
  val OrganisaatioClass = classOf[Organisaatio]
  val OrganisaatioWithOidClass = classOf[OrganisaatioWithOid]
  val classes = List(OrganisaatioClass, OrganisaatioWithOidClass)

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), Organisaatio] = {
    case (TypeInfo(c, _), json) if (classes.contains(c)) =>
      json match {
        case organisaatio: JObject if organisaatio.values.contains("oppilaitosnumero") => organisaatio.extract[Oppilaitos]
        case organisaatio: JObject if organisaatio.values.contains("tutkintotoimikunnanNumero") => organisaatio.extract[Tutkintotoimikunta]
        case organisaatio: JObject if organisaatio.values.contains("oid") => organisaatio.extract[OidOrganisaatio]
        case organisaatio: JObject => organisaatio.extract[Yritys]
      }
  }
}

object LocalizedStringDeserializer extends Deserializer[LocalizedString] {
  val LocalizedStringClass = classOf[LocalizedString]

  override def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), LocalizedString] = {
    case (TypeInfo(LocalizedStringClass, _), json: JObject) if json.values.contains("fi") => json.extract[Finnish]
    case (TypeInfo(LocalizedStringClass, _), json: JObject) if json.values.contains("sv") => json.extract[Swedish]
    case (TypeInfo(LocalizedStringClass, _), json: JObject) if json.values.contains("en") => json.extract[English]
  }
}

case class CannotDeserializeException(deserializer: Deserializer[_], json: JValue) extends RuntimeException(deserializer + " cannot deserialize " + Json.write(json))