import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../../helpers/effects.mjs'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class DaggerHeartItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['daggerheart', 'sheet', 'item'],
      width: 520,
      height: 480,
    })
  }

  /** @override */
  get template () {
    const path = 'systems/daggerheart/templates/item'
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    // Retrieve base data structure.
    const context = super.getData()
    context.domains = []
    context.cardTypes = []
    context.traits = []

    // Use a safe clone of the item data for further operations.
    const itemData = context.data

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = this.item.getRollData()

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system
    context.flags = itemData.flags

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects)

    if (['domain'].includes(itemData.type)) {
      this._getDomainData(context)
    }

    if (['weapon'].includes(itemData.type)) {
      this._getWeaponData(context)
    }

    if (itemData.type === 'card') {
      this._getCardData(context);
    }

    return context
  }

  _getDomainData(context) {
    context.domains = CONFIG.DAGGERHEART.domains
  }

  _getWeaponData(context) {
    context.traits = Object.keys(CONFIG.DAGGERHEART.abilities).map((key) => {
      const label = game.i18n.localize(CONFIG.DAGGERHEART.abilities[key])
      const value = key

      return { label, value }
    })

    context.burden = Object.keys(CONFIG.DAGGERHEART.burden).map((key) => {
      const label = CONFIG.DAGGERHEART.burden[key]
      const value = key

      return { label, value }
    })

    context.attack_types = Object.keys(CONFIG.DAGGERHEART.attack_types).map(
      (key) => ({
        value: key,
        label: CONFIG.DAGGERHEART.attack_types[key],
      }),
    )

    context.range = Object.keys(CONFIG.DAGGERHEART.range).map((key) => {
      const label = CONFIG.DAGGERHEART.range[key]
      const value = key

      return { label, value }
    })
  }

  _getCardData(context) {
    context.cardTypes = Object.keys(CONFIG.DAGGERHEART.cardTypes).map(
      (key) => {
        const label = CONFIG.DAGGERHEART.cardTypes[key]
        const value = key

        return { label, value }
      },
    )
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return

    html.on('click', '[data-action=\'feature-add\']', async () => {
      const newFeature = {
        id: await crypto.randomUUID(),
        name: '',
        description: '',
      }

      this.item.update({
        'system.cardFeatures': [
          ...this.item.system.cardFeatures,
          newFeature],
      })
    })

    html.on('click', '[data-action=\'feature-delete\']', async (ev) => {
      const id = $(ev.currentTarget).data('id')

      const allItems = this.item.system.cardFeatures.filter((i) => i.id !== id)
      await this.item.update({ [`system.cardFeatures`]: allItems })
    })

    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item),
    )
  }
}
