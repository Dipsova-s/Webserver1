function DashboardWidgetDefinitionView() {
    var self = this;
    self.GetWidgetsTemplate = function () {
        return [
            '<div class="widget-definition">',
                '<!-- ko foreach: { data: Widgets, as: \'widget\' } -->',
                '<div class="item displayNameContainer small">',
                    '<div class="front">',
                        '<i class="icon" data-bind="visible: widget.icon_display, css: widget.icon_display"></i>',
                    '</div>',
                    '<div class="name" data-role="tooltip" data-tooltip-position="bottom" data-showwhenneed="true" data-bind="text: widget.name"></div>',
                    '<div class="rear">',
                        '<!-- ko if: widget.icon_publish -->',
                        '<i class="icon" data-bind="css: widget.icon_publish"></i>',
                        '<!-- /ko -->',
                    '</div>',
                    '<!-- ko if: widget.has_angle -->',
                    '<a class="icon icon-meatballs btn-definition"  data-role="tooltip" data-tooltip-position="bottom" data-bind="attr: { \'data-tooltip-text\': Localization.Edit }, click: $root.ShowPopup"></a>',
                    '<!-- /ko -->',
                '</div>',
                '<!-- /ko -->',
            '</div>'
        ].join('');
    };
    self.GetWidgetTemplate = function () {
       return [
            '<div class="form-row">',
               '<div class="form-col form-col-body col-name">',
                   '<div class="input-fieldset">',
                       '<input type="text" class="name" maxlength="255" data-bind="',
                       ' enable: CanUpdateWidget(),',
                       ' value: Widget.widget_name,',
                       ' valueUpdate: \'afterkeydown\',',
                       ' event: { blur: $root.CheckWidgetName },',
                       ' css: { placeholder: Widget.default_name() === Widget.widget_name() }" />',
                       '<label class="legend" data-bind="text: Localization.Name"></label>',
                   '</div>',
               '</div>',
            '</div>',
            '<div class="form-row">',
                '<div class="form-col form-col-body col-displays">',
                    '<ul class="listview display-listview scrollable">',
                        '<!-- ko foreach: { data: Widget.displays, as: \'display\' } -->',
                        '<li class="listview-item" data-bind="css: { readonly: !display.enable }">',
                            '<label>',
                                '<input type="radio" name="display" data-bind="attr: { value: display.uri, id: \'Display\' + $index() }, checked: $root.Widget.selected, enable: display.enable"/>',
                                '<span class="label"></span>',
                            '</label>',
                            '<label class="displayNameContainer small" data-bind="attr: { for: \'Display\' + $index() }">',
                                '<div class="front">',
                                    '<i class="icon" data-bind="css: display.icon_display"></i>',
                                '</div>',
                                '<div class="name" data-role="tooltip" data-tooltip-position="bottom" data-showwhenneed="true" data-bind="text: display.name"></div>',
                                '<div class="rear">',
                                    '<i class="icon" data-bind="css: display.icon_publish"></i>',
                                    '<i class="icon" data-bind="css: display.icon_valid"></i>',
                                    '<i class="icon" data-bind="css: display.icon_filter"></i>',
                                    '<i class="icon" data-bind="css: display.icon_parameters"></i>',
                                '</div>',
                            '</label>',
                            '<a class="icon icon-link btn-link" target="_blank" data-role="tooltip" data-tooltip-position="bottom" data-bind="attr: { href: display.link, \'data-tooltip-text\': Captions.Button_Dashboard_WidgetGotoAngle }, click: $root.OpenDisplay"></a>',
                        '</li>',
                        '<!-- /ko -->',
                   '</ul>',
                '</div>',
            '</div>'
        ].join('');
    };
 }
