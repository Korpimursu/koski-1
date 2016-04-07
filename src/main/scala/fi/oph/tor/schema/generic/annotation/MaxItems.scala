package fi.oph.tor.schema.generic.annotation

import fi.oph.tor.schema.generic.{Metadata, MetadataSupport}
import org.json4s.JsonAST.{JInt, JObject}

object MaxItems extends MetadataSupport[MaxItems] {
  override def metadataClass = classOf[MaxItems]

  override def appendMetadataToJsonSchema(obj: JObject, metadata: MaxItems) = appendToDescription(obj.merge(JObject("maxItems" -> JInt(metadata.value))), "(Arvoja korkeintaan: " + metadata.value + ")")
}

case class MaxItems(value: Int) extends Metadata