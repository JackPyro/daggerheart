import DaggerHeartFeature from "./feature.mjs";

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

    schema.cardFeatures = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        name: new fields.StringField(),
        description: new fields.StringField(),
      })
    );

    return schema;
  }
}
