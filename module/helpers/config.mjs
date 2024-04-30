export const DAGGERHEART = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
DAGGERHEART.abilities = {
  agi: 'DAGGERHEART.Ability.agi.long',
  str: 'DAGGERHEART.Ability.str.long',
  fin: 'DAGGERHEART.Ability.fin.long',
  inst: 'DAGGERHEART.Ability.inst.long',
  prs: 'DAGGERHEART.Ability.prs.long',
  knwl: 'DAGGERHEART.Ability.knwl.long',
};

DAGGERHEART.abilityAbbreviations = {
  agi: 'DAGGERHEART.Ability.agi.abbr',
  str: 'DAGGERHEART.Ability.str.abbr',
  fin: 'DAGGERHEART.Ability.fin.abbr',
  inst: 'DAGGERHEART.Ability.inst.abbr',
  prs: 'DAGGERHEART.Ability.prs.abbr',
  knwl: 'DAGGERHEART.Ability.knwl.abbr',
};

DAGGERHEART.domains = {
  arcana: "Arcana",
  blade: "Blade",
  bone: "Bone",
  codex: "Codex",
  grace: "Grace",
  midnight: "Midnight",
  sage: "Sage",
  splendor: "Splendor",
  valor: "Valor",
}

DAGGERHEART.cardTypes = {
  community: "Community",
  subclass: "Subclass",
  ancestry: "Ancestry",
  class: "Class Feature",
}

DAGGERHEART.burden = {
  "1H": "1 Hand",
  "2H": "2 Hand",
}

DAGGERHEART.range = {
  MELEE: "Melee",
  VERY_CLOSE: "Very Close",
  CLOSE: "Close",
  FAR: "Far",
  VERY_FAR: "Very Far",
}

DAGGERHEART.enemy_types = {
  bruiser: "Bruiser",
  horde: "Horde",
  leader: "Leader",
  minion: "Minion",
  ranged: "Ranged",
  skulk: "Skulk",
  social: "Social",
  solo: "Solo",
  standart: "Standard",
  support: "Support",
}

DAGGERHEART.attack_types = {
  "phy": "Physical",
  "mag": "Magical"
}