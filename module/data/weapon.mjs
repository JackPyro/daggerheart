import { DAGGERHEART } from "../helpers/config.mjs";

export default class DaggerHeartWeapon extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.trait = new fields.StringField({
      blank: true,
    });

    schema.range = new fields.StringField({
      blank: true,
    });

    schema.type = new fields.StringField({
      initial: "phy"
    });

    schema.damage = new fields.StringField({
      blank: true,
    });

    schema.isEquipped = new fields.BooleanField({
      initial: false,
    });

    schema.isSecondary = new fields.BooleanField({
      initial: false
    })
    
    schema.burden = new fields.StringField({
      blank: true,
      initial: DAGGERHEART.burden["1H"],
    });

    schema.feature = new fields.StringField({
      blank: true,
    });

    return schema;
  }
}
