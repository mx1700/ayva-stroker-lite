<template>
  <div class="free-play">
    <!-- Presets Section - Top -->
    <div class="free-play-container lil-gui root">
      <div class="title">
        <span>Presets</span>
        <span class="preset-actions">
          <button
            class="preset-save-btn"
            title="Save current settings as preset"
            @click="openSavePresetModal"
          >
            + Save
          </button>
        </span>
      </div>
      <div class="limits lil-gui children preset-list">
        <div v-if="presets.length === 0" class="no-presets">
          No presets saved yet. Click "+ Save" to save current settings.
        </div>
        <div
          v-for="preset in presets"
          :key="preset"
          class="preset-item"
        >
          <button
            class="preset-name"
            title="Click to apply preset"
            @click="applyPreset(preset)"
          >
            {{ preset }}
          </button>
          <div class="preset-item-actions">
            <button
              class="preset-action-btn"
              title="Overwrite preset with current settings"
              @click="overwritePreset(preset)"
            >
              💾
            </button>
            <button
              class="preset-action-btn"
              title="Rename preset"
              @click="openRenamePresetModal(preset)"
            >
              ✎
            </button>
            <button
              class="preset-action-btn delete"
              title="Delete preset"
              @click="openDeletePresetModal(preset)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="free-play-container lil-gui root">
      <div class="title">
        <span>Parameters</span>
        <span class="guide" @click.stop>
          <a href="https://ayvajs.github.io/ayvajs-docs/tutorial-ayva-stroker-lite.html" target="_blank">Help</a>
        </span>
      </div>
      <div class="limits lil-gui children">
        <div class="limit">
          <div class="axis">
            Change BPM
          </div>
          <ayva-bpm-select
            v-model="bpmMode"
            storage-key="free-play-bpm-mode"
            @change="onUpdate('bpm-mode', $event)"
          />
        </div>

        <div class="limit">
          <div class="axis">
            BPM Range
          </div>
          <ayva-slider
            ref="bpmSlider"
            v-model="bpmValue"
            :options="bpmOptions"
            storage-key="free-play-bpm"
            @update="onUpdate('bpm', $event)"
          />
        </div>

        <div class="limit">
          <div class="axis" :disabled="disableAcceleration">
            Acceleration (bpm/s)
          </div>
          <ayva-slider
            ref="accelerationSlider"
            v-model="accelerationValue"
            :options="accelerationOptions"
            :disabled="disableAcceleration"
            storage-key="free-play-acceleration"
            @update="onUpdate('acceleration', $event)"
          />
        </div>

        <div class="limit">
          <div class="axis">
            Pattern Duration
          </div>
          <ayva-slider
            ref="patternDurationSlider"
            v-model="patternDurationValue"
            :options="patternDurationOptions"
            storage-key="free-play-pattern-duration"
            @update="onUpdate('pattern-duration', $event)"
          />
        </div>

        <div class="limit">
          <div class="axis">
            Transition Duration
          </div>
          <ayva-slider
            ref="transitionDurationSlider"
            v-model="transitionDurationValue"
            :options="transitionDurationOptions"
            storage-key="free-play-transition-duration"
            @update="onUpdate('transition-duration', $event)"
          />
        </div>

        <div class="limit twist">
          <div class="axis">
            Default Twist
          </div>
          <div>
            <ayva-checkbox v-model="twist" storage-key="free-play-enable-twist" />
          </div>
        </div>

        <div class="limit">
          <div
            class="axis"
            :disabled="disableTwist"
          >
            Twist Range
          </div>

          <ayva-slider
            ref="twistRangeSlider"
            v-model="twistRangeValue"
            :options="twistRangeOptions"
            :disabled="disableTwist"
            storage-key="free-play-twist-range"
            @update="onUpdate('twist-range', $event)"
          />
        </div>

        <div class="limit">
          <div
            class="axis"
            :disabled="disableTwist"
          >
            Twist Phase
          </div>
          <ayva-slider
            ref="twistPhaseSlider"
            v-model="twistPhaseValue"
            :options="twistPhaseOptions"
            :disabled="disableTwist"
            storage-key="free-play-twist-phase"
            @update="onUpdate('twist-phase', $event)"
          />
        </div>

        <div class="limit">
          <div
            class="axis"
            :disabled="disableTwist"
          >
            Twist Eccentricity
          </div>
          <ayva-slider
            ref="twistEccSlider"
            v-model="twistEccValue"
            :options="twistEccOptions"
            :disabled="disableTwist"
            storage-key="free-play-twist-ecc"
            @update="onUpdate('twist-ecc', $event)"
          />
        </div>
      </div>
    </div>
    <div ref="strokesContainer" class="free-play-container lil-gui root">
      <div class="title">
        <span>Strokes</span>
        <span v-show="currentStrokeName !== 'None'" class="current-stroke-container">
          <span class="label">Playing:</span>
          <span class="current-stroke">{{ currentStrokeName }}</span>
        </span>
        <span v-show="currentStrokeName === 'None'" class="settings-container" @click.stop>
          <n-dropdown
            placement="bottom-start"
            trigger="click"
            size="small"
            :options="settingsOptions"
            :disabled="mode !== 'Stopped'"
            @select="onSettings"
          >
            <settings-icon :disabled="mode !== 'Stopped' ? '' : null" class="settings icon" @click.stop />
          </n-dropdown></span>
      </div>
      <div class="limits lil-gui children" style="padding-top: 0;">
        <!-- <div class="info">
          Select what strokes to include in free play mode, or click buttons to manually trigger a stroke
          (manually triggering a stroke will transition out of free play mode).
        </div> -->

        <div ref="tempestStrokeContainer" class="tempest-stroke-container">
          <div class="tempest-stroke">
            <div class="checkbox">
              <ayva-checkbox v-model="selectAllStrokes" />
            </div>
            <div>
              <div class="info">
                Select or manually trigger a stroke.
              </div>
            </div>
            <div class="stroke-actions" />
          </div>
          <template v-for="stroke of strokes" :key="stroke.name">
            <div class="tempest-stroke">
              <div class="checkbox">
                <ayva-checkbox
                  v-model="stroke.enabled"
                  :storage-key="`free-play-pattern-${stroke.name}`"
                  @change="fireUpdateStrokes"
                />
              </div>
              <div>
                <button :title="stroke.name" @click="fireSelectStroke(stroke.name)">
                  {{ stroke.name }}
                </button>
              </div>
              <div class="stroke-actions">
                <n-popover
                  trigger="hover"
                  raw
                  :show-arrow="false"
                  :delay="250"
                  @update:show="previewStroke(stroke.name, $event)"
                >
                  <template #trigger>
                    <eye-icon class="preview icon" :disabled="stroke.type !== 'tempest-stroke' ? '' : undefined" />
                  </template>
                  <div :data-preview-stroke="stroke.name" />
                </n-popover>
                <n-dropdown
                  placement="bottom-start"
                  trigger="click"
                  size="small"
                  :options="customStrokeActions"
                  :disabled="mode !== 'Stopped'"
                  @select="onCustomStrokeAction(stroke, $event)"
                >
                  <settings-icon v-show="stroke.custom" class="settings icon" :disabled="mode !== 'Stopped' ? '' : null" />
                </n-dropdown>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <ayva-modal :show="showStrokeEditor" lil-gui>
      <tempest-stroke-editor ref="strokeEditor" :edit-stroke="editStroke" @close="showStrokeEditor = false" @save="refreshStrokes" />
    </ayva-modal>

    <ayva-modal :show="showScriptEditor" lil-gui>
      <ayva-script-editor ref="strokeEditor" :edit-script="editScript" @close="showScriptEditor = false" @save="refreshStrokes" />
    </ayva-modal>

    <!-- Save Preset Modal -->
    <ayva-modal :show="showSavePresetModal" @close="closeSavePresetModal">
      <div class="preset-modal">
        <div class="preset-modal-title">
          Save Preset
        </div>
        <div class="preset-modal-content">
          <input
            v-model="newPresetName"
            type="text"
            class="preset-name-input"
            placeholder="Enter preset name"
            @keyup.enter="savePreset"
            @keyup.escape="closeSavePresetModal"
          >
          <div v-if="newPresetNameError" class="preset-error">
            {{ newPresetNameError }}
          </div>
        </div>
        <div class="preset-modal-actions">
          <button class="preset-modal-btn cancel" @click="closeSavePresetModal">
            Cancel
          </button>
          <button class="preset-modal-btn save" @click="savePreset">
            Save
          </button>
        </div>
      </div>
    </ayva-modal>

    <!-- Rename Preset Modal -->
    <ayva-modal :show="showRenamePresetModal" @close="closeRenamePresetModal">
      <div class="preset-modal">
        <div class="preset-modal-title">
          Rename Preset
        </div>
        <div class="preset-modal-content">
          <input
            v-model="newPresetName"
            type="text"
            class="preset-name-input"
            placeholder="Enter new preset name"
            @keyup.enter="renamePreset"
            @keyup.escape="closeRenamePresetModal"
          >
          <div v-if="newPresetNameError" class="preset-error">
            {{ newPresetNameError }}
          </div>
        </div>
        <div class="preset-modal-actions">
          <button class="preset-modal-btn cancel" @click="closeRenamePresetModal">
            Cancel
          </button>
          <button class="preset-modal-btn save" @click="renamePreset">
            Rename
          </button>
        </div>
      </div>
    </ayva-modal>

    <!-- Delete Preset Modal -->
    <ayva-modal :show="showDeletePresetModal" @close="closeDeletePresetModal">
      <div class="preset-modal">
        <div class="preset-modal-title">
          Delete Preset
        </div>
        <div class="preset-modal-content">
          <p>Are you sure you want to delete preset "{{ deletingPresetName }}"?</p>
        </div>
        <div class="preset-modal-actions">
          <button class="preset-modal-btn cancel" @click="closeDeletePresetModal">
            Cancel
          </button>
          <button class="preset-modal-btn delete" @click="confirmDeletePreset">
            Delete
          </button>
        </div>
      </div>
    </ayva-modal>
  </div>
</template>

<script>
import { TempestStroke } from 'ayvajs';
import OSREmulator from 'osr-emu';
import { useNotification } from 'naive-ui';
import { h, nextTick } from 'vue';
import { createAyva } from '../lib/ayva-config.js';
import AyvaSlider from './widgets/AyvaSlider.vue';
import AyvaCheckbox from './widgets/AyvaCheckbox.vue';
import AyvaBpmSelect from './widgets/AyvaBpmSelect.vue';
import AyvaScriptEditor from './AyvaScriptEditor.vue';
import TempestStrokeEditor from './TempestStrokeEditor.vue';
import AyvaModal from './AyvaModal.vue';
import {
  makeCollapsible, formatter, clampHeight
} from '../lib/util.js';
import CustomBehaviorStorage from '../lib/custom-behavior-storage.js';
import FreePlayPresetStorage from '../lib/free-play-preset-storage.js';

let previewAyva = null;
let previewEmulator = null;

const customBehaviorStorage = new CustomBehaviorStorage();
const presetStorage = new FreePlayPresetStorage();

export default {

  components: {
    AyvaSlider,
    AyvaCheckbox,
    AyvaBpmSelect,
    AyvaScriptEditor,
    TempestStrokeEditor,
    AyvaModal,
  },

  inject: ['globalAyva', 'deviceType', 'createRubjoyEmulator'],

  props: {
    currentStrokeName: {
      type: String,
      default: null,
    },

    mode: {
      type: String,
      default: null,
    },
  },

  emits: ['update-parameters', 'update-strokes', 'select-stroke'],

  setup () {
    const notification = useNotification();
    return {
      notify: notification,
    };
  },

  data () {
    return {
      twist: false,

      // v-model 绑定的滑块值
      bpmValue: [20, 60],
      accelerationValue: [0, 20],
      patternDurationValue: [5, 10],
      transitionDurationValue: [2, 5],
      twistRangeValue: [0, 1],
      twistPhaseValue: [0],
      twistEccValue: [0],

      bpmOptions: {
        range: {
          min: 0,
          max: 200,
        },
        start: [20, 60],
        padding: [10],
        step: 1,
        format: formatter(),
      },
      accelerationOptions: {
        range: {
          min: 0,
          max: 200,
        },
        start: [0, 20],
        step: 1,
        format: formatter(),
      },
      patternDurationOptions: {
        range: {
          min: 0,
          max: 30,
        },
        start: [5, 10],
        padding: [1],
        step: 0.1,
        format: formatter(1, 's'),
      },
      transitionDurationOptions: {
        range: {
          min: 0,
          max: 30,
        },
        start: [2, 5],
        padding: [0.5],
        step: 0.1,
        format: formatter(1, 's'),
      },
      twistRangeOptions: {
        range: {
          min: 0,
          max: 1,
        },
        start: [0, 1],
        margin: 0.1,
      },
      twistPhaseOptions: {
        range: {
          min: -4,
          max: 4,
        },
        start: [0],
      },
      twistEccOptions: {
        range: {
          min: -1,
          max: 1,
        },
        start: [0],
      },

      strokes: [],

      customBehaviorLibrary: {},

      previewElement: null,
      previewParent: null,

      showScriptEditor: false,

      editScript: null,

      showStrokeEditor: false,

      editStroke: null,

      bpmMode: 'transition',

      settingsOptions: [{
        key: 'create-stroke',
        label: 'Create TempestStroke',
      }, {
        key: 'create-script',
        label: 'Create AyvaScript',
      }, {
        key: 'import',
        label: 'Import',
      }, {
        key: 'export',
        label: 'Export',
      }],

      customStrokeActions: [{
        key: 'edit',
        label: 'Edit',
      }, {
        key: 'export',
        label: 'Export',
      }, {
        key: 'delete',
        label: 'Delete',
      }],

      // Preset management
      presets: [],
      showSavePresetModal: false,
      showRenamePresetModal: false,
      showDeletePresetModal: false,
      deletingPresetName: '',
      newPresetName: '',
      editingPresetName: '',
      newPresetNameError: '',
    };
  },

  computed: {
    disableTwist () {
      return !this.twist ? '' : null;
    },

    disableAcceleration () {
      return this.bpmMode !== 'continuous' ? '' : null;
    },

    selectAllStrokes: {
      get () {
        return this.strokes.reduce((enabled, stroke) => enabled && stroke.enabled, true);
      },

      set (value) {
        this.strokes.forEach((stroke) => {
          stroke.enabled = !!value;
        });
      },
    },
  },

  watch: {
    twist: {
      immediate: true,
      handler (value) {
        this.fireUpdateParameter('twist', value);
      },
    },

    strokes: {
      immediate: true,
      handler () {
        this.fireUpdateStrokes();
      },
    },

    selectAllStrokes () {
      this.fireUpdateStrokes();
    },

    deviceType () {
      this.resetEmulator();
    },
  },

  mounted () {
    this.$el.querySelectorAll('.free-play-container').forEach((element) => {
      makeCollapsible(element);
    });

    this.previewElement = document.createElement('div');
    this.previewElement.classList.add('preview-popup');

    this.resetEmulator();

    window.addEventListener('resize', this.onResize);

    this.refreshStrokes();

    this.onResize();

    this.fireUpdateParameter('bpm-mode', this.bpmMode);

    this.loadPresets();
  },

  unmounted () {
    window.removeEventListener('resize', this.onResize);
  },

  methods: {
    refreshStrokes () {
      const enabledMap = this.strokes.reduce((map, next) => {
        map[next.name] = next.enabled;
        return map;
      }, {});

      this.customBehaviorLibrary = customBehaviorStorage.load();

      const makeLibraryList = (library, custom = false) => Object.keys(library).sort().map((name) => ({
        name,
        custom,
        type: library[name].type || 'tempest-stroke',
        enabled: enabledMap[name] ?? true,
      }));

      const tempestLibrary = TempestStroke.library;

      const filteredTempestLibrary = Object.keys(tempestLibrary).filter(
        (key) => !this.customBehaviorLibrary[key]
      ).reduce((filteredLibrary, key) => {
        filteredLibrary[key] = tempestLibrary[key];
        return filteredLibrary;
      }, {});

      this.strokes = [
        ...makeLibraryList(this.customBehaviorLibrary, true),
        ...makeLibraryList(filteredTempestLibrary)];

      this.onResize();
    },

    onResize () {
      nextTick(() => {
        if (!this.$refs.strokesContainer.classList.contains('closed')) {
          const childHeight = this.$refs.tempestStrokeContainer.getBoundingClientRect().height;
          clampHeight(this.$refs.strokesContainer, 200, childHeight + 50);
        }
      });
    },

    onUpdate (name, value) {
      this.fireUpdateParameter(name, value);
    },

    onSettings (key) {
      if (key === 'create-stroke') {
        this.openStrokeEditor();
      } else if (key === 'create-script') {
        this.openScriptEditor();
      } else if (key === 'import') {
        const onConflicts = (conflicts) => {
          this.notify.warning({
            content: 'Some strokes renamed due to conflicts:',
            meta: () => h('div', conflicts.map((c) => h('div', c))),
          });
        };

        customBehaviorStorage.import(onConflicts).then(() => {
          this.refreshStrokes();
        }).catch((error) => {
          console.error(error?.stack); // eslint-disable-line no-console
          this.notify.error({
            content: 'Error importing stroke:',
            meta: error.message,
          });
        });
      } else if (key === 'export') {
        customBehaviorStorage.export();
      }
    },

    onCustomStrokeAction (stroke, action) {
      if (action === 'delete') {
        customBehaviorStorage.delete(stroke.name);
        this.refreshStrokes();
      } else if (action === 'edit' && stroke.type === 'tempest-stroke') {
        this.openStrokeEditor(stroke.name);
      } else if (action === 'edit' && stroke.type === 'ayvascript') {
        this.openScriptEditor(stroke.name);
      } else if (action === 'export') {
        customBehaviorStorage.exportOne(stroke.name);
      }
    },

    openScriptEditor (editScript = null) {
      this.editScript = editScript;
      this.showScriptEditor = true;
      this.animateEditorResize(1000);
    },

    openStrokeEditor (editStroke = null) {
      this.editStroke = editStroke;
      this.showStrokeEditor = true;
      this.animateEditorResize(1000);
    },

    animateEditorResize (delay, lastTime) {
      window.dispatchEvent(new Event('resize'));

      if (!lastTime) {
        requestAnimationFrame(this.animateEditorResize.bind(this, delay, performance.now()));
      } else {
        const elapsed = performance.now() - lastTime;
        const remaining = delay - elapsed;

        if (remaining > 0) {
          requestAnimationFrame(this.animateEditorResize.bind(this, remaining, performance.now()));
        }
      }
    },

    fireUpdateStrokes () {
      const selectedStrokes = this.strokes.filter((s) => s.enabled).map((s) => s.name);
      this.$emit('update-strokes', selectedStrokes);
    },

    fireUpdateParameter (name, value) {
      this.$emit('update-parameters', {
        name,
        value,
      });
    },

    fireSelectStroke (stroke) {
      this.$emit('select-stroke', stroke);
    },

    previewStroke (stroke, show) {
      this.destroyPreview();

      if (show) {
        setTimeout(() => {
          const tempestStroke = TempestStroke.library[stroke];

          const behavior = tempestStroke ? {
            name: stroke,
            type: 'tempest-stroke',
            data: tempestStroke,
          } : this.customBehaviorLibrary[stroke];

          if (behavior.type !== 'tempest-stroke') {
            return;
          }

          this.previewParent = document.querySelector(`[data-preview-stroke="${stroke}"]`);
          this.previewParent.appendChild(this.previewElement);
          const container = this.previewParent.closest('.v-binder-follower-content');
          container.classList.add('preview-popup-container');

          previewAyva = this.createPreviewAyva();
          previewAyva.addOutput(previewEmulator);

          const uniqueAxes = Object.keys(previewAyva.axes).reduce((map, axisName) => {
            const axis = previewAyva.axes[axisName];
            map[axis.name] = axis;
            return map;
          }, {});

          Object.entries(uniqueAxes).forEach(([name]) => {
            // Reset all preview axes.
            previewAyva.$[name].value = 0.5;
          });

          previewAyva.do(new TempestStroke(behavior.data));
        }, 100);
      }
    },

    createPreviewAyva () {
      const ayva = createAyva();

      // Copy all axis limits from global Ayva instance.
      Object.keys(ayva.axes).forEach((name) => {
        ayva.updateLimits(name, this.globalAyva.$[name].min, this.globalAyva.$[name].max);
      });

      return ayva;
    },

    destroyPreview () {
      if (previewAyva) {
        previewAyva.stop();
        previewAyva = null;
      }

      if (this.previewParent) {
        this.previewParent.removeChild(this.previewElement);
        this.previewParent = null;
      }
    },

    resetEmulator () {
      if (previewEmulator) {
        previewEmulator.destroy();
      }

      if (this.deviceType === 'RUBJOY') {
        previewEmulator = this.createRubjoyEmulator(this.previewElement);
      } else {
        previewEmulator = new OSREmulator(this.previewElement, { model: this.deviceType });
      }
    },

    // ==================== Preset Management ====================

    loadPresets () {
      this.presets = presetStorage.list();
    },

    getCurrentParameters () {
      // 从 v-model 绑定的值获取当前滑块值
      const params = {
        bpmMode: this.bpmMode,
        bpm: this.bpmValue,
        acceleration: this.accelerationValue,
        patternDuration: this.patternDurationValue,
        transitionDuration: this.transitionDurationValue,
        twist: this.twist,
        twistRange: this.twistRangeValue,
        twistPhase: this.twistPhaseValue,
        twistEcc: this.twistEccValue,
      };

      // Get stroke enabled states
      const strokeStates = {};
      this.strokes.forEach((stroke) => {
        strokeStates[stroke.name] = stroke.enabled;
      });

      return {
        params,
        strokes: strokeStates,
      };
    },

    savePreset () {
      const name = this.newPresetName.trim();

      if (!name) {
        this.newPresetNameError = 'Preset name cannot be empty';
        return;
      }

      if (this.presets.includes(name)) {
        this.newPresetNameError = 'Preset name already exists';
        return;
      }

      const data = this.getCurrentParameters();
      presetStorage.save(name, data);
      this.loadPresets();
      this.closeSavePresetModal();

      this.notify.success({
        content: `Preset "${name}" saved successfully`,
        duration: 1000,
      });
    },

    applyPreset (name) {
      const preset = presetStorage.get(name);

      if (!preset) {
        this.notify.error({
          content: `Preset "${name}" not found`,
        });
        return;
      }

      // Apply parameters via v-model binding
      const { params, strokes } = preset;

      this.bpmMode = params.bpmMode;
      this.bpmValue = [...params.bpm];
      this.accelerationValue = [...params.acceleration];
      this.patternDurationValue = [...params.patternDuration];
      this.transitionDurationValue = [...params.transitionDuration];
      this.twist = params.twist;
      this.twistRangeValue = Array.isArray(params.twistRange) ? [...params.twistRange] : params.twistRange;
      this.twistPhaseValue = Array.isArray(params.twistPhase) ? [...params.twistPhase] : params.twistPhase;
      this.twistEccValue = Array.isArray(params.twistEcc) ? [...params.twistEcc] : params.twistEcc;

      // Apply stroke enabled states
      this.strokes.forEach((stroke) => {
        if (strokes[stroke.name] !== undefined) {
          stroke.enabled = strokes[stroke.name];
        }
      });

      // Use nextTick to ensure DOM is updated, then call slider set methods
      this.$nextTick(() => {
        // Call slider set methods to update the actual slider values
        if (this.$refs.bpmSlider) {
          this.$refs.bpmSlider.set(...params.bpm);
        }
        if (this.$refs.accelerationSlider) {
          this.$refs.accelerationSlider.set(...params.acceleration);
        }
        if (this.$refs.patternDurationSlider) {
          this.$refs.patternDurationSlider.set(...params.patternDuration);
        }
        if (this.$refs.transitionDurationSlider) {
          this.$refs.transitionDurationSlider.set(...params.transitionDuration);
        }
        if (this.$refs.twistRangeSlider) {
          this.$refs.twistRangeSlider.set(...params.twistRange);
        }
        if (this.$refs.twistPhaseSlider) {
          const twistPhaseValue = Array.isArray(params.twistPhase) ? params.twistPhase : [params.twistPhase];
          this.$refs.twistPhaseSlider.set(...twistPhaseValue);
        }
        if (this.$refs.twistEccSlider) {
          const twistEccValue = Array.isArray(params.twistEcc) ? params.twistEcc : [params.twistEcc];
          this.$refs.twistEccSlider.set(...twistEccValue);
        }

        // Emit updates to parent component
        this.fireUpdateParameter('bpm-mode', this.bpmMode);
        this.fireUpdateParameter('bpm', this.bpmValue);
        this.fireUpdateParameter('acceleration', this.accelerationValue);
        this.fireUpdateParameter('pattern-duration', this.patternDurationValue);
        this.fireUpdateParameter('transition-duration', this.transitionDurationValue);
        this.fireUpdateParameter('twist', this.twist);
        this.fireUpdateParameter('twist-range', this.twistRangeValue);
        this.fireUpdateParameter('twist-phase', this.twistPhaseValue);
        this.fireUpdateParameter('twist-ecc', this.twistEccValue);

        this.fireUpdateStrokes();
      });

      this.notify.success({
        content: `Applied preset "${name}"`,
        duration: 1000,
      });
    },

    overwritePreset (name) {
      const data = this.getCurrentParameters();
      presetStorage.save(name, data);

      this.notify.success({
        content: `Preset "${name}" overwritten`,
        duration: 1000,
      });
    },

    deletePreset (name) {
      presetStorage.delete(name);
      this.loadPresets();

      this.notify.info({
        content: `Preset "${name}" deleted`,
      });
    },

    openDeletePresetModal (name) {
      this.deletingPresetName = name;
      this.showDeletePresetModal = true;
    },

    closeDeletePresetModal () {
      this.showDeletePresetModal = false;
      this.deletingPresetName = '';
    },

    confirmDeletePreset () {
      const name = this.deletingPresetName;
      presetStorage.delete(name);
      this.loadPresets();
      this.closeDeletePresetModal();

      this.notify.info({
        content: `Preset "${name}" deleted`,
      });
    },

    renamePreset () {
      const oldName = this.editingPresetName;
      const newName = this.newPresetName.trim();

      if (!newName) {
        this.newPresetNameError = 'Preset name cannot be empty';
        return;
      }

      if (this.presets.includes(newName) && newName !== oldName) {
        this.newPresetNameError = 'Preset name already exists';
        return;
      }

      const success = presetStorage.rename(oldName, newName);

      if (success) {
        this.loadPresets();
        this.closeRenamePresetModal();

        this.notify.success({
          content: `Preset renamed to "${newName}"`,
          duration: 1000,
        });
      } else {
        this.notify.error({
          content: 'Failed to rename preset',
        });
      }
    },

    openSavePresetModal () {
      this.newPresetName = '';
      this.newPresetNameError = '';
      this.showSavePresetModal = true;
    },

    closeSavePresetModal () {
      this.showSavePresetModal = false;
      this.newPresetName = '';
      this.newPresetNameError = '';
    },

    openRenamePresetModal (name) {
      this.editingPresetName = name;
      this.newPresetName = name;
      this.newPresetNameError = '';
      this.showRenamePresetModal = true;
    },

    closeRenamePresetModal () {
      this.showRenamePresetModal = false;
      this.editingPresetName = '';
      this.newPresetName = '';
      this.newPresetNameError = '';
    },
  },
};
</script>

<style scoped>

.axis {
  display: flex;
  align-items: center;
}

.preview.icon {
  color: var(--ayva-text-color-off-white);
  margin-top: 0;
  height: 20px;
  cursor: default;
}

.preview.icon[disabled] {
  cursor: not-allowed;
}

.stroke-actions {
  padding-left: 10px;
}

.settings.icon {
  width: 18px;
  outline: none;
  position: relative;
  top: 2px;
  margin-right: 3px;
}

.settings.icon[disabled] {
  opacity: 0.25;
}

.stroke-actions .settings.icon {
  top: -1px;
  margin-left: 5px;
}

.info {
  content: "Empty";
  padding: 0 var(--padding);
  margin: 2px 0;
  display: block;
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.75;
  align-items: center;
  justify-content: center;
  display: flex;
  gap: 10px;
}

.free-play-container .title {
  display: flex;
  align-items: flex-start;
}

.free-play-container .title > *:not(.settings-container) {
  position: relative;
  top: 2px;
}

.current-stroke-container, .settings-container {
  padding-left: 25px;
  margin-left: auto;
}

.current-stroke-container {
  display: flex;
}

.tempest-stroke button:focus {
  border: none;
}

.tempest-stroke button {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 10px;
}

.guide {
  margin-left: auto;
  padding-left: 25px;
}

.guide a {
  color: var(--ayva-blue);
}

/* Preset Section Styles */
.preset-actions {
  margin-left: auto;
}

.preset-save-btn {
  background: var(--ayva-blue);
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.preset-save-btn:hover {
  background: #1e88e5;
}

.preset-list {
  padding-top: 0 !important;
}

.no-presets {
  padding: 15px;
  text-align: center;
  color: var(--ayva-text-color);
  opacity: 0.7;
  font-style: italic;
}

.preset-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preset-item:last-child {
  border-bottom: none;
}

.preset-name {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--ayva-text-color);
  text-align: left;
  cursor: pointer;
  padding: 5px;
  font-size: 13px;
  transition: background 0.2s;
}

.preset-name:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.preset-item-actions {
  display: flex;
  gap: 5px;
}

.preset-action-btn {
  background: transparent;
  border: none;
  color: var(--ayva-text-color);
  cursor: pointer;
  padding: 3px 6px;
  font-size: 12px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.preset-action-btn:hover {
  opacity: 1;
}

.preset-action-btn.delete:hover {
  color: #ff5252;
}

/* Preset Modal Styles */
.preset-modal {
  padding: 20px;
  min-width: 300px;
}

.preset-modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--ayva-text-color);
}

.preset-modal-content {
  margin-bottom: 20px;
}

.preset-name-input {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  color: var(--ayva-text-color);
  font-size: 14px;
}

.preset-name-input:focus {
  outline: none;
  border-color: var(--ayva-blue);
}

.preset-error {
  color: #ff5252;
  font-size: 12px;
  margin-top: 8px;
}

.preset-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preset-modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.preset-modal-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
  color: var(--ayva-text-color);
}

.preset-modal-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preset-modal-btn.save {
  background: var(--ayva-blue);
  color: white;
}

.preset-modal-btn.save:hover {
  background: #1e88e5;
}

.preset-modal-btn.delete {
  background: #ff5252;
  color: white;
}

.preset-modal-btn.delete:hover {
  background: #ff1744;
}
</style>
