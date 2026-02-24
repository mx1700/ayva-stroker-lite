import Storage from './ayva-storage.js';

const storage = new Storage('free-play-presets');

const fileOptions = {
  types: [
    {
      description: 'Ayva Free Play Presets',
      accept: {
        'application/json': ['.json'],
      },
    },
  ],
  excludeAcceptAllOption: true,
  multiple: false,
  suggestedName: 'ayva-presets.json',
};

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

  /**
   * Export all presets to a JSON file.
   */
  async exportAll () {
    let fileHandle;

    try {
      fileHandle = await window.showSaveFilePicker(fileOptions);
    } catch (abortError) {
      return;
    }

    const writable = await fileHandle.createWritable();
    const presets = this.loadAll();
    await writable.write(JSON.stringify(presets, null, 2));
    await writable.close();
  }

  /**
   * Import presets from a JSON file.
   * Presets with conflicting names will be renamed.
   * @returns {Array<string>} Array of imported preset names (may differ from original if renamed).
   */
  async importAll () {
    let fileHandle;

    try {
      [fileHandle] = await window.showOpenFilePicker(fileOptions);
    } catch (abortError) {
      return [];
    }

    const file = await fileHandle.getFile();
    const importedPresets = JSON.parse(await file.text());

    if (typeof importedPresets !== 'object' || importedPresets === null) {
      throw new SyntaxError('Invalid preset file.');
    }

    const currentPresets = this.loadAll();
    const renamed = [];

    for (const [name, data] of Object.entries(importedPresets)) {
      let finalName = name;

      if (currentPresets[finalName] || this.list().includes(finalName)) {
        // Append a number to preset name when there is a conflict.
        let nextIndex = 2;

        while (currentPresets[finalName] || this.list().includes(finalName)) {
          finalName = `${name}-${nextIndex++}`;
        }

        renamed.push(finalName);
      }

      currentPresets[finalName] = data;
    }

    storage.save('all', currentPresets);

    return renamed;
  }
}

export default FreePlayPresetStorage;
