function FilterBooleanEditor(handler, queryStep, element) {
    var self = this;

    // general
    self.GetOperators = function () {
        return ko.toJS([].concat(
            enumHandlers.QUERYSTEPOPERATOR.DEFAULT,
            enumHandlers.QUERYSTEPOPERATOR.GROUPONE));
    };

    // single argument
    self.GetSingleArgumentTemplate = function () {
        // create specific template for boolean

        var name = 'input-' + jQuery.GUID();
        var template = jQuery(self.parent.prototype.GetSingleArgumentTemplate());
        template.find('.col-input-value').html([
            '<div class="input-argument-boolean-value">',
                '<label>',
                    '<input class="input-argument-value input-argument-true" type="radio" name="' + name + '" />',
                    '<span class="label inline">' + Localization.Yes + '</span>',
                '</label>',
                '<label>',
                    '<input class="input-argument-value input-argument-false" type="radio" name="' + name + '" />',
                    '<span class="label">' + Localization.No + '</span>',
                '</label>',
            '</div>',
            '<a class="icon icon-setting-horizontal btn-select-field" data-role="tooltip" data-tooltip-position="bottom" data-tooltip-text="' + Localization.CompareValue + '"></a>'
        ].join(''));
        return template;
    };
    self.InitialSingleArgumentUI = function (container) {
        // call base to perform argument type field
        self.parent.prototype.InitialSingleArgumentUI.call(self, container);

        // set value to ui
        var argument = self.Data.arguments()[0];
        if (self.IsArgumentTypeValue(argument)) {
            container.find('.input-argument-' + argument.value).prop('checked', true);
        }

        // events
        container.find('.input-argument-true').off('change').on('change', jQuery.proxy(self.SetSingleArgumentValue, self, true));
        container.find('.input-argument-false').off('change').on('change', jQuery.proxy(self.SetSingleArgumentValue, self, false));
    };
    self.SetSingleArgumentValue = function (value) {
        self.Data.arguments([self.GetObjectArgumentValue(value)]);
    };

    // compare field
    self.GetCompareFieldTarget = function () {
        return enumHandlers.FIELDTYPE.BOOLEAN;
    };

    // constructor
    self.Initial(handler, queryStep, element);
}
FilterBooleanEditor.extend(BaseFilterEditor);