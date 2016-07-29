/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Component that details how a Blockly.Field is
 * rendered in the toolbox in AccessibleBlockly. Also handles any interactions
 * with the field.
 * @author madeeha@google.com (Madeeha Ghori)
 */

blocklyApp.FieldComponent = ng.core
  .Component({
    selector: 'blockly-field',
    template: `
    <input *ngIf="isTextInput()" [id]="mainFieldId"
           [ngModel]="field.getValue()" (ngModelChange)="field.setValue($event)"
           [disabled]="disabled" type="text" aria-label="Press Enter to edit text">

    <input *ngIf="isNumberInput()" [id]="mainFieldId"
           [ngModel]="field.getValue()" (ngModelChange)="field.setValue($event)"
           [disabled]="disabled" type="number" aria-label="Press Enter to edit number">

    <div *ngIf="isDropdown()"
         [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-argument-menu', idMap['label'])">
      <label [id]="mainFieldId">{{'CURRENT_ARGUMENT_VALUE'|translate}} {{field.getText()}}</label>
      <ol role="group">
        <li [id]="idMap[optionValue]" role="treeitem" *ngFor="#optionValue of getOptions()"
            [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap[optionValue + 'Button'], 'blockly-button')">
          <button [id]="idMap[optionValue + 'Button']" (click)="handleDropdownChange(field, optionValue)"
                  [disabled]="disabled">
            {{optionText[optionValue]}}
          </button>
        </li>
      </ol>
    </div>

    <div *ngIf="isCheckbox()">
      // Checkboxes are not currently supported.
    </div>

    <label [id]="mainFieldId" *ngIf="isTextField() && hasVisibleText()">
      {{field.getText()}}
    </label>
    `,
    inputs: ['field', 'index', 'parentId', 'disabled', 'mainFieldId'],
    pipes: [blocklyApp.TranslatePipe]
  })
  .Class({
    constructor: [blocklyApp.UtilsService, function(_utilsService) {
      this.optionText = {
        keys: []
      };
      this.utilsService = _utilsService;
    }],
    ngOnInit: function() {
      var elementsNeedingIds = this.generateElementNames(this.field);
      // Warning: this assumes that the elements returned by
      // this.generateElementNames() are unique.
      this.idMap = this.utilsService.generateIds(elementsNeedingIds);
    },
    generateAriaLabelledByAttr: function(mainLabel, secondLabel) {
      return mainLabel + ' ' + secondLabel;
    },
    generateElementNames: function() {
      var elementNames = [];
      if (this.isDropdown()) {
        var keys = this.getOptions();
        for (var i = 0; i < keys.length; i++){
          elementNames.push(keys[i], keys[i] + 'Button');
        }
      }
      return elementNames;
    },
    isNumberInput: function() {
      return this.field instanceof Blockly.FieldNumber;
    },
    isTextInput: function() {
      return this.field instanceof Blockly.FieldTextInput &&
          !(this.field instanceof Blockly.FieldNumber);
    },
    isDropdown: function() {
      return this.field instanceof Blockly.FieldDropdown;
    },
    isCheckbox: function() {
      return this.field instanceof Blockly.FieldCheckbox;
    },
    isTextField: function() {
      return !(this.field instanceof Blockly.FieldTextInput) &&
          !(this.field instanceof Blockly.FieldDropdown) &&
          !(this.field instanceof Blockly.FieldCheckbox);
    },
    hasVisibleText: function() {
      var text = this.field.getText().trim();
      return !!text;
    },
    getOptions: function() {
      if (this.optionText.keys.length) {
        return this.optionText.keys;
      }
      var options = this.field.getOptions_();
      for (var i = 0; i < options.length; i++) {
        var tuple = options[i];
        this.optionText[tuple[1]] = tuple[0];
        this.optionText.keys.push(tuple[1]);
      }
      return this.optionText.keys;
    },
    handleDropdownChange: function(field, text) {
      if (text == 'NO_ACTION') {
        return;
      }
      if (this.field instanceof Blockly.FieldVariable) {
        Blockly.FieldVariable.dropdownChange.call(this.field, text);
      } else {
        this.field.setValue(text);
      }
    }
  });
