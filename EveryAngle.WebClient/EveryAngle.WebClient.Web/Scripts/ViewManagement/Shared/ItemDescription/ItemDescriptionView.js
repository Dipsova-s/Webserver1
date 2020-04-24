function ItemDescriptionView() {
    "use strict";

    var self = this;

    self.GetEditTemplate = function () {
        return [
            '<div class="description-editor">',
              '<div class="form-row">',
                   '<div class="form-col form-col-body col-id">',
                        '<div class="input-fieldset">',
                            '<input type="text" class="item-id" maxlength="100" />',
                            '<label class="legend">' + Localization.ID + '</label>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="form-row">',
                    '<div class="form-col form-col-body col-languages">',
                        '<div class="languages"></div>',
                    '</div>',
                '</div>',
                '<div class="form-row">',
                    '<div class="form-col form-col-body col-name">',
                        '<div class="input-fieldset">',
                            '<input type="text" class="name" maxlength="255" />',
                            '<label class="legend">' + Localization.Name + '</label>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="form-row">',
                    '<div class="form-col form-col-body col-description">',
                        '<textarea class="description"></textarea>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('');
    };
}
