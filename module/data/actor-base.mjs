export default class DaggerHeartActorBase extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 6, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 6 })
    });
    schema.stress = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 6, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 6 })
    });
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields

    return schema;
  }
}