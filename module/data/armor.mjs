export default class DaggerHeartArmor extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.score = new fields.NumberField({
      initial: 0
    });
    
    schema.tier = new fields.NumberField({
      initial: 0
    });

    schema.feature = new fields.StringField({
      blank: true,
    });

    schema.isEquipped = new fields.BooleanField({
      initial: false,
    });

    return schema;
  }
}
