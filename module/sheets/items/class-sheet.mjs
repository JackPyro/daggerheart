import DaggerHeartFeature from '../../data/feature.mjs'
import {
  onManageActiveEffect, prepareActiveEffectCategories,
} from '../../helpers/effects.mjs'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class DaggerHeartClassSheet extends ItemSheet {
  /** @override */
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['daggerheart', 'sheet', 'item'],
      width: 650,
      height: 480,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'stats',
        }],
    })
  }

  /** @override */
  get template () {
    return `systems/daggerheart/templates/item/item-class-sheet.hbs`
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

    if (['class'].includes(itemData.type)) {
      context.domains = CONFIG.DAGGERHEART.domains
    }

    return context
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    if (!this.isEditable) return

    html.on('click', '[data-action="class-feature-add"]', async () => {
      const newFeature = {
        id: await crypto.randomUUID(), name: '', description: '',
      }

      this.item.update({
        'system.classFeatures': [
          ...this.item.system.classFeatures, newFeature],
      })
    })

    html.on('click', '[data-action="class-feature-delete"]', async (ev) => {
      const id = $(ev.currentTarget).data('id')

      const allItems = this.item.system.classFeatures.filter((i) => i.id !== id)
      await this.item.update({ [`system.classFeatures`]: allItems })
    })

    html.on('click', '[data-action="class-domain-add"]', async (ev) => {
      const allDomains = this.item.system.selectedDomains
      const newDomain = { id: await crypto.randomUUID(), name: '' }
      allDomains.push(newDomain)
      await this.item.update({ 'system.selectedDomains': allDomains })
    })

    html.on('click', '[data-action="class-domain-delete"]', async (ev) => {
      const id = $(ev.currentTarget).data('id')
      const allDomains = this.item.system.selectedDomains.filter(
        (i) => i.id !== id)

      await this.item.update({ 'system.selectedDomains': allDomains })
    })

    html.on('click', '[data-action="add-tier"]', async (ev) => {
      const type = $(ev.currentTarget).data('type')
      const allItems = this.item.system[type]
      const tierOption = {
        id: await crypto.randomUUID(), option: '', checked: false,
      }

      allItems.push(tierOption)
      await this.item.update({ [`system.${type}`]: allItems })
    })

    html.on('click', '[data-action="remove-tier"]', async (ev) => {
      const type = $(ev.currentTarget).data('type')
      const id = $(ev.currentTarget).data('id')

      const allItems = this.item.system[type].filter((i) => i.id !== id)
      await this.item.update({ [`system.${type}`]: allItems })
    })

    html.on('click', '[data-action="add-class-item-choice"]', async (ev) => {
      const item = {
        id: await crypto.randomUUID(), choice1: ' ', choice2: ' ',
      }
      const allItems = this.item.system.choiceItems
      allItems.push(item)

      this.item.update({ 'system.choiceItems': allItems })
    })

    html.on('click', '[data-action="remove-class-item-choice"]', async (ev) => {
      const id = $(ev.currentTarget).data('id')
      const allItems = this.item.system.choiceItems.filter((i) => i.id !== id)
      this.item.update({ 'system.choiceItems': allItems })
    })

    html.on('click', '[data-action="class-info-add"]', async (ev) => {
      const type = $(ev.currentTarget).data('type')
      const allQuestions = this.item.system[type]
      const question = {
        id: await crypto.randomUUID(), question: '', answer: '',
      }

      allQuestions.push(question)
      this.item.update({ [`system.${type}`]: allQuestions })
    })

    html.on('click', '[data-action="class-info-delete"]', async (ev) => {
      const type = $(ev.currentTarget).data('type')
      const id = $(ev.currentTarget).data('id')

      const allQuestions = this.item.system[type].filter((i) => i.id !== id)

      this.item.update({ [`system.${type}`]: allQuestions })
    })

    // Active Effect management
    html.on('click', '.effect-control',
      (ev) => onManageActiveEffect(ev, this.item))
  }
}
