export default class DaggerHeartCard extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.cardType = new fields.StringField({});
    schema.description = new fields.StringField({
      initial: "",
    });
    schema.feature = new fields.StringField({
      required: true,
      initial: "",
    });

    return schema;
  }
}
