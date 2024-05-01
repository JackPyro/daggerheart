export default class DaggerHeartCard extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.cardType = new fields.StringField({});
    schema.subType = new fields.StringField({});

    schema.feature = new fields.StringField({
      required: true,
      initial: "",
    });

    return schema;
  }
}
