export default class DaggerHeartDomain extends foundry.abstract.TypeDataModel {
  static defineSchema () {
    const fields = foundry.data.fields
    const schema = {}

    schema.domain = new fields.StringField({
      blank: true,
    })

    schema.domainType = new fields.StringField({
      blank: true,
    })

    schema.feature = new fields.StringField({
      blank: true,
    })

    schema.hasTracker = new fields.SchemaField({
      enabled: new fields.BooleanField({
        initial: false,
      }),
      property: new fields.StringField({
        initial: '',
      }),
      current: new fields.NumberField({
        initial: 0,
      }),
    })

    schema.recall = new fields.NumberField({ initial: 0, integer: true })
    schema.level = new fields.NumberField({ initial: 0, integer: true })

    schema.active = new fields.BooleanField({ initial: false })

    return schema
  }
}
