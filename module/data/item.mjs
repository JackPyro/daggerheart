import DaggerHeartItemBase from "./item-base.mjs";

export default class DaggerHeartItem extends DaggerHeartItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    return schema;
  }
}