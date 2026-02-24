import Storage from './ayva-storage.js';

const storage = new Storage('free-play-presets');

class FreePlayPresetStorage {
  /**
   * Load all presets from storage.
   * @returns {Object} Object with preset names as keys and preset data as values.
   */
  loadAll () {
    return storage.load('all') || {};
  }

  /**
   * Save a new preset or update an existing one.
   * @param {string} name - Preset name.
   * @param {Object} data - Preset data containing parameters and strokes.
   */
  save (name, data) {
    const presets = this.loadAll();
    presets[name] = data;
    storage.save('all', presets);
  }

  /**
   * Get a specific preset by name.
   * @param {string} name - Preset name.
   * @returns {Object|null} Preset data or null if not found.
   */
  get (name) {
    const presets = this.loadAll();
    return presets[name] || null;
  }

  /**
   * Delete a preset by name.
   * @param {string} name - Preset name.
   */
  delete (name) {
    const presets = this.loadAll();
    delete presets[name];
    storage.save('all', presets);
  }

  /**
   * Rename a preset.
   * @param {string} oldName - Current preset name.
   * @param {string} newName - New preset name.
   * @returns {boolean} True if successful, false if old preset doesn't exist or new name already exists.
   */
  rename (oldName, newName) {
    const presets = this.loadAll();

    if (!presets[oldName]) {
      return false;
    }

    if (presets[newName]) {
      return false;
    }

    presets[newName] = presets[oldName];
    delete presets[oldName];
    storage.save('all', presets);

    return true;
  }

  /**
   * Get list of all preset names.
   * @returns {Array<string>} Array of preset names.
   */
  list () {
    return Object.keys(this.loadAll()).sort();
  }
}

export default FreePlayPresetStorage;
