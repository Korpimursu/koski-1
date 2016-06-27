package fi.oph.koski.schema

import java.time.LocalDate

import fi.oph.koski.localization.LocalizedString
import fi.oph.scalaschema.annotation.{Description, MaxItems, MinItems}

@Description("Ammatilliseen peruskoulutukseen valmentava koulutus (VALMA)")
case class AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOpiskeluoikeus(
  id: Option[Int] = None,
  versionumero: Option[Int] = None,
  lähdejärjestelmänId: Option[LähdejärjestelmäId] = None,
  alkamispäivä: Option[LocalDate] = None,
  päättymispäivä: Option[LocalDate] = None,
  oppilaitos: Oppilaitos,
  koulutustoimija: Option[OrganisaatioWithOid] = None,
  tila: Option[AmmatillinenOpiskeluoikeudenTila] = None,
  läsnäolotiedot: Option[YleisetLäsnäolotiedot] = None,
  @MinItems(1) @MaxItems(1)
  suoritukset: List[AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenSuoritus],
  @KoodistoKoodiarvo("valma")
  tyyppi: Koodistokoodiviite = Koodistokoodiviite("valma", "opiskeluoikeudentyyppi")
) extends KoskeenTallennettavaOpiskeluoikeus {
  override def withIdAndVersion(id: Option[Int], versionumero: Option[Int]) = this.copy(id = id, versionumero = versionumero)
  override def withKoulutustoimija(koulutustoimija: OrganisaatioWithOid) = this.copy(koulutustoimija = Some(koulutustoimija))
  override def arvioituPäättymispäivä = None
}

@Description("Ammatilliseen peruskoulutukseen valmentava koulutus (VALMA)")
case class AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenSuoritus(
  suorituskieli: Option[Koodistokoodiviite] = None,
  tila: Koodistokoodiviite,
  toimipiste: OrganisaatioWithOid,
  vahvistus: Option[Henkilövahvistus] = None,
  @Description("Ammatilliseen peruskoulutukseen valmentavan koulutuksen osasuoritukset")
  override val osasuoritukset: Option[List[AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsanSuoritus]],
  @KoodistoKoodiarvo("valma")
  tyyppi: Koodistokoodiviite = Koodistokoodiviite("valma", koodistoUri = "suorituksentyyppi"),
  koulutusmoduuli: AmmatilliseenPeruskoulutukseenValmentavaKoulutus,
  todistuksellaNäkyvätLisätiedot: Option[LocalizedString] = None
) extends ValmentavaSuoritus

case class AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsanSuoritus(
  suorituskieli: Option[Koodistokoodiviite] = None,
  tila: Koodistokoodiviite,
  vahvistus: Option[Henkilövahvistus] = None,
  @KoodistoKoodiarvo("valmakoulutuksenosa")
  tyyppi: Koodistokoodiviite = Koodistokoodiviite("valmakoulutuksenosa", koodistoUri = "suorituksentyyppi"),
  koulutusmoduuli: AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsa,
  arviointi: Option[List[AmmatillinenArviointi]],
  tunnustettu: Option[Tunnustaminen] = None,
  lisätiedot: Option[List[AmmatillisenTutkinnonOsanLisätieto]] = None
) extends ValmentavanKoulutuksenOsanSuoritus

@Description("Ammatilliseen peruskoulutukseen valmentavan koulutuksen (VALMA) tunnistetiedot")
case class AmmatilliseenPeruskoulutukseenValmentavaKoulutus(
  @KoodistoKoodiarvo("999901")
  tunniste: Koodistokoodiviite = Koodistokoodiviite("999901", koodistoUri = "koulutus"),
  laajuus: Option[Laajuus] = None
) extends Koulutus

@Description("Ammatilliseen peruskoulutukseen valmentavan koulutuksen osan tunnistetiedot")
case class AmmatilliseenPeruskoulutukseenValmentavanKoulutuksenOsa(
  tunniste: PaikallinenKoodi,
  laajuus: Option[LaajuusOsaamispisteissä],
  pakollinen: Boolean
) extends PaikallinenKoulutusmoduuli with Valinnaisuus
