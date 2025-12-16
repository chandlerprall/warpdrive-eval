import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

/**
 * DebugPanel Component
 * 
 * A collapsible panel for displaying raw JSON:API response data.
 * Useful for learning and debugging WarpDrive requests/responses.
 * 
 * @param {string} @json - JSON string to display (typically response.content)
 * 
 * @example
 * <DebugPanel @json={{JSON.stringify @model.rawResponse.content null 2}} />
 */
export default class DebugPanel extends Component {
  @tracked isExpanded = false;

  toggle = () => {
    this.isExpanded = !this.isExpanded;
  };

  <template>
    <div class="debug-panel">
      <button type="button" class="debug-toggle" {{on "click" this.toggle}}>
        {{if this.isExpanded "▼" "▶"}}
        Debug: Raw Response
      </button>
      {{#if this.isExpanded}}
        <pre class="debug-content">{{@json}}</pre>
      {{/if}}
    </div>
  </template>
}

