package fi.oph.koski.editor

import java.time.LocalDate

import org.json4s.{Extraction, _}

sealed trait EditorModel {
  def empty = false
}

case class ObjectModel(`class`: String, properties: List[EditorProperty], data: Option[AnyRef]) extends EditorModel {
  override def empty = !properties.exists(!_.model.empty)
}
case class EditorProperty(key: String, title: String, model: EditorModel, hidden: Boolean)

case class ListModel(items: List[EditorModel]) extends EditorModel { // need to add a prototype for adding new item
  override def empty = !items.exists(!_.empty)
}

case class EnumeratedModel(value: EnumValue, alternatives: List[EnumValue]) extends EditorModel
  object EnumeratedModel {
    def apply(value: EnumValue): EnumeratedModel = EnumeratedModel(value, List(value))
  }
  case class EnumValue(title: String, data: Any)

case class NumberModel(data: Number) extends EditorModel
case class BooleanModel(data: Boolean) extends EditorModel
case class DateModel(data: LocalDate) extends EditorModel
case class StringModel(data: String) extends EditorModel

case class OptionalModel(model: Option[EditorModel]) extends EditorModel { // need a prototype for editing
  override def empty = !model.exists(!_.empty)
}

case class OneOfModel(`class`: String, model: EditorModel) extends EditorModel { // need to add option prototypes for editing
  override def empty = model.empty
}

object EditorModelSerializer extends Serializer[EditorModel] {
  override def deserialize(implicit format: Formats) = PartialFunction.empty

  override def serialize(implicit format: Formats): PartialFunction[Any, JValue] = {
    case (model: EditorModel) => {
      val json: JValue = model match {
        case (ObjectModel(c, properties, data)) => d("object", "class" -> c, "properties" -> properties, "data" -> data)
        case (OptionalModel(model)) => model.map(serialize _).getOrElse(j()).merge(j("optional" -> true))
        case (ListModel(items)) => d("array", "items" -> items)
        case (EnumeratedModel(EnumValue(title, data), alternatives)) => d("enum", "data" -> data, "title" -> title, "alternatives" -> alternatives)
        case (OneOfModel(c, model)) => serialize.apply(model).merge(j("one-of-class" -> c))
        case (NumberModel(data)) => d("number", "data" -> data)
        case (BooleanModel(data)) => d("boolean", "data" -> data)
        case (DateModel(data)) => d("date", "data" -> data)
        case (StringModel(data)) => d("string", "data" -> data)
      }
      model.empty match {
        case true => json merge(j("empty" -> true))
        case _ => json
      }
    }
  }

  private def d(tyep: String, props: (String, Any)*)(implicit format: Formats) = {
    val elems: List[(String, Any)] = ("type" -> tyep) :: props.toList
    j(elems: _*)
  }

  private def j(props: (String, Any)*)(implicit format: Formats): JValue = Extraction.decompose(Map(props : _*))
}