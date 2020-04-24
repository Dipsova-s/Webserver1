WC.WidgetDetailsView = new WidgetDetailsView();

function WidgetDetailsView() {
    "use strict";

    var self = this;

    self.TemplateBaseClasses = [
        '<!-- ko foreach: { data: Data.QueryBlocks, as: \'block\' } -->',
        '<!-- ko if: block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.BASE_CLASSES -->',
        '<!-- ko if: block.base_classes.length -->',
        '<h3 class="definitionsHeader definitionsObjectHeader">',
            '<span data-bind="text: Localization.StartObject"></span>',
        '</h3>',
        '<!-- /ko -->',
        '<ul class="detailDefinitionList inline" data-bind="foreach: { data: block.base_classes, as: \'object\' }, attr: { \'title\': $root.GetBaseClassesTitle(block.base_classes) }, visible: block.base_classes.length">',
            '<li>',
                '<span data-bind="text: $root.GetFilterText(object, block.base_classes.length > 1? enumHandlers.FRIENDLYNAMEMODE.SHORTNAME : enumHandlers.FRIENDLYNAMEMODE.LONGNAME )" class="object"></span>',
                '<i class="icon" data-bind="attr: { \'title\': $root.GetInvalidErrorMessage(object) }, css: $root.GetInvalidCssClass(object) || \'none\'"></i>',
                '<!-- ko if: $root.CanViewBaseClassInfo -->',
                '<a class=\"btnInfo icon icon-info\" data-bind="visible: $root.CanViewBaseClassInfo, attr: { \'onclick\': $root.ClickShowBaseClassInfoPopupString, \'data-id\': object }"></a>',
                '<!-- /ko -->',
            '</li>',
        '</ul>',
        '<!-- /ko -->',
        '<!-- /ko -->'
    ].join('');

    self.TemplateQueryBlocks = [
        '<!-- ko foreach: { data: Data.QueryBlocks, as: \'block\' } -->',
        '<!-- ko if: block.queryblock_type === enumHandlers.QUERYBLOCKTYPE.QUERY_STEPS -->',
        '<ul class="detailDefinitionList queryList" data-bind="foreach: { data: block.query_steps, as: \'query\' }">',
            '<!-- ko if: $root.IsVisible($index(), query.step_type) -->',
            '<li class="displayNameContainer small" data-bind="css: $root.GetQueryStepCssClass(query, $index())">',
                '<div class="front">',
                    '<i class="icon" data-bind="css: \'icon-\' + query.step_type"></i>',
                '</div>',
                '<span class="name" data-bind="text: $root.GetFilterText(query), attr: { title: $root.GetFilterText(query) }"></span>',
                '<div class="rear">',
                    '<i class="icon" data-bind="css: { \'icon-parameterized\': ko.toJS(query.is_execution_parameter), none: !ko.toJS(query.is_execution_parameter) }"></i>',
                    '<i class="icon" data-bind="css: $root.GetInvalidCssClass(query) || \'none\', attr: { \'title\': $root.GetInvalidErrorMessage(query) }"></i>',
                '</div>',
            '</li>',
            '<!-- /ko -->',
        '</ul>',
        '<!-- /ko -->',
        '<!-- /ko -->',
        '<!-- ko if: $root.IsMoreVisible() -->',
        '<ul class="detailDefinitionList">',
        '<li class="displayNameContainer">',
            '<span class="name">...</span>',
        '</li>',
        '</ul>',
        '<!-- /ko -->'
    ].join('');

    self.TemplateExecuteModelRole = [
        '<!-- ko if: $root.IsVisibleModelRoles() -->',
        '<div class="sectionModelRole">',
            '<h3 class="modelRoleHeader">',
                '<span data-bind="text: Labels.HeaderModelRole + \':\'"></span>',
            '</h3>',
            '<ul class="modelRoleList" data-bind="foreach: { data: Data.ModelRoles, as: \'role\' }">',
                '<li data-bind="text: role.role_id, attr: { title: role.model_id !== undefined ? role.model_id + \' model role\' : \'System role\' }"></li>',
            '</ul>',
        '</div>',
        '<!-- /ko -->'
    ].join('');

    self.TemplateDisplayList = [
        '<!-- ko if: $root.IsVisibleDisplayList() -->',
        '<div class="sectionDescriptions" id="angleInfoLabelSectionPopup" >',
            '<div class="clearfix" data-bind="foreach:  { data: Data.Labels , as: \'label\' }">',
                '<span class="InfoFocus"><span data-bind="text: label"></span></span>',
            '</div>',
        '</div>',
        '<div class="sectionDefinitions" id="angleInfoDisplaySectionPopup">',
            '<h3>',
                '<span data-bind="text: Localization.Display + \'s\'"></span>',
            '</h3>',
            '<ul class="detailDefinitionList" data-bind="foreach: { data: Data.DisplayDefinitions, as: \'display\' }">',
                '<li class="displayNameContainer large" data-bind="click: $root.ClickRow, css: { cursorPointer: $root.ClickableRow }">',
                    '<div class="front">',
                        '<i class="icon" data-bind="css: { none: display.is_public, \'icon-private\': !display.is_public }"></i>',
                        '<i class="icon" data-bind="attr: { \'class\': \'icon icon-\'+ (display.display_type || \'new\'), href: $root.GetAngleDisplayURL(display) }, css: { default: display.is_angle_default, schedule: display.used_in_task }"></i>',
                        '<i class="icon" data-bind="css: { followup: $root.HaveFollowupInDisplay(display.query_blocks), filter: $root.HaveFilterDisplay(display.query_blocks), noFilter: !$root.HaveFilterDisplay(display.query_blocks)}"></i> ',
                    '</div>',
                    '<a class="name nameLink displayName" data-bind="text: display.name, attr: { href: $root.GetAngleDisplayURL(display), title: display.name }, click: $root.ShowExecutionParameterPopup.bind(display, $root.Angle), clickBubble: false"></a>',
                    '<div class="rear">',
                        '<i class="icon" data-bind="css: { \'icon-parameterized\': display.is_parameterized, none: !display.is_parameterized }"></i>',
                        '<i class="icon" data-bind="css: $root.GetInvalidDisplayCssClass(display) || \'none\'"></i>',
                    '</div>',
                '</li>',
            '</ul>',
        '</div>',
        '<!-- /ko -->'
    ].join('');

    self.TemplateWidgetList = [
        '<!-- ko if: $root.IsVisibleWidgetList() -->',
            '<div class="sectionDescriptions" id=\"dashboardInfoLabelSectionPopup\" >',
                '<div class="clearfix" data-bind="foreach:  { data: Data.Labels , as: \'label\' }">',
                    '<span class="InfoFocus"><span data-bind="text: label"></span></span>',
                '</div>',
            '</div>',
            '<div class="sectionDefinitions" id=\"dashboardInfoWidgetSectionPopup\">',
                '<h3 data-bind="text: Localization.Widgets"></h3>',
                '<div data-bind="foreach:  { data: Data.Widgets, as: \'widget\' }">',
                    '<div class="modelName" data-bind="text: modelName, visible: ($root.Data.Widgets() && $root.Data.Widgets().length > 1)"></div>',
                    '<div data-bind="foreach:  { data: widget.angleList, as: \'widget\' }">',
                        '<div class="displayNameContainer large dashboardInfoWidgetAngleSection">',
                            '<div class="front">',
                                '<i class="icon icon-angle"></i>',
                            '</div>',
                            '<span class="name angleName" data-bind="text: widget.angle.name"></span>',
                            '<div class="rear">',
                                '<i class="icon" data-bind="css: { none: widget.angle.is_published,  \'icon-private\': !widget.angle.is_published }"></i>',
                                '<i class="icon" data-bind="css: $root.IsValidWidgetAngle(widget.angle) ? \'validError\' : \'none\'"></i>',
                                '<i class="icon" data-bind="css: { \'icon-parameterized\': widget.angle.is_parameterized, none: !widget.angle.is_parameterized }"></i>',
                                '<i class="icon" data-bind="css: {  \'icon-validated\': widget.angle.is_validated, none: !widget.angle.is_validated }"></i>',
                            '</div>',
                        '</div>',
                        '<ul class=\"detailDefinitionList widgetDetailDefinitionList\" data-bind="foreach: { data: widget.displays, as: \'display\' }">',
                            '<li class="displayNameContainer large">',
                                '<div class="front">',
                                    '<a class="icon" data-bind="attr: { \'class\': \'icon \'+ (display.display_type || \'new\'), href: $root.GetWidgetURL(display, widget.angle) }, css: { default: display.is_angle_default, schedule: display.used_in_task }, click: $root.ShowExecutionParameterPopup.bind(display, widget.angle)"></a>',
                                '</div>',
                                '<a class=\"name nameLink displayName\" data-bind="text: display.name, attr: { href: $root.GetWidgetURL(display, widget.angle) }, click: $root.ShowExecutionParameterPopup.bind(display, widget.angle), clickBubble: false"></a>',
                                '<div class="rear">',
                                    '<i class="icon" data-bind="css: { none: display.is_public, \'icon-private\': !display.is_public }"></i>',
                                    '<i class="icon" data-bind="css: $root.GetInvalidDisplayCssClass(display) || \'none\' "></i>',
                                    '<i class="icon" data-bind="css: { \'icon-followup\': $root.HaveFollowupInDisplay(display.query_blocks), \'icon-filter\': $root.HaveFilterDisplay(display.query_blocks), none: !$root.HaveFilterDisplay(display.query_blocks)}"></i> ',
                                    '<i class="icon" data-bind="css: { \'icon-parameterized\': display.is_parameterized, none: !display.is_parameterized }"></i>',
                                '</div>',
                            '</li>',
                        '</ul>',
                    '</div>',
                '</div>',
            '</div>',
        '<!-- /ko -->'
    ].join('');

    self.Template = [
        '<!-- ko stopBinding: true -->',
        '<div class="widgetDetailsWrapper" data-bind="css: { full: FullMode }">',
            '<div class="sectionDescriptions" data-bind="visible: !FullMode() || (FullMode() && WC.HtmlHelper.StripHTML(Data.Description()))">',
                '<!-- ko if: !FullMode() -->',
                '<h2 class="descriptionHeader">',
                    '<span data-bind="text: Labels.HeaderDescription"></span>',
                    '<a data-bind="text: Labels.ButtonEdit, attr: { \'onclick\': ClickShowEditPopupString }"></a>',
                '</h2>',
                '<!-- /ko -->',
                '<p class="descriptionBody" data-bind="html: GetDescription()"></p>',
            '</div>',
            '<!-- ko if: $root.IsVisibleDefinition() -->',
            '<div data-bind="css: $root.IsOpenFromSearchpage() ? \'sectionDescriptions\': \'sectionDefinitions\'">',
                '<!-- ko if: $root.IsOpenFromSearchpage() -->',
                '<h3>',
                    '<span data-bind="text: Localization.Definition"></span>',
                '</h3>',
                '<!-- /ko -->',
                self.TemplateBaseClasses,
                '<h3 class="definitionsHeader">',
                    '<span data-bind="html: GetDefinitionHeader()"></span>',
                    '<!-- ko if: !FullMode() -->',
                    '<a class="btnInfo icon icon-info" data-bind="attr: { \'onclick\': ClickShowQueryStepsPopupString }"></a>',
                    '<!-- /ko -->',
                '</h3>',
                self.TemplateQueryBlocks,
            '</div>',
            '<!-- /ko -->',
            self.TemplateExecuteModelRole,
            self.TemplateDisplayList,
            self.TemplateWidgetList,
        '</div>',
        '<!-- /ko -->'
    ].join('');

    self.TemplateAngleDisplay = [
        '<!-- ko stopBinding: true -->',
        '<div class="widgetDetailsWrapper" data-bind="css: { full: FullMode }">',
            '<div class="sectionDetailTitle">',
                '<div class="row" data-bind="if: $root.IsVisibleModelInfo">',
                    '<div class="label" data-bind="text: Labels.HeaderModelInfo"></div><div class="text" data-bind="text: $root.GetModelInfo()"></div>',
                '</div>',
                '<div class="row">',
                    '<div class="label" data-bind="text: Labels.HeaderAngleTitle"></div><div class="text" data-bind="text: Data.AngleName"></div>',
                '</div>',
                '<div class="row">',
                    '<div class="label" data-bind="text: Labels.HeaderDisplayTitle"></div><div class="text" data-bind="text: Data.DisplayName"></div>',
                '</div>',
            '</div>',
            '<div class="sectionDescriptions">',
                '<h2 class="descriptionHeader">',
                    '<span data-bind="text: Labels.HeaderAngleDescription"></span>',
                '</h2>',
                '<p class="descriptionBody" data-bind="html: Data.AngleDescription() || \'<i>No detail</i>\' "></p>',
            '</div>',
            '<div class="sectionDescriptions">',
                '<h2 class="descriptionHeader">',
                    '<span data-bind="text: Labels.HeaderDisplayDescription"></span>',
                '</h2>',
                '<p class="descriptionBody" data-bind="html: Data.DisplayDescription() || \'<i>No detail</i>\'"></p>',
            '</div>',
            '<div class="sectionDefinitions">',
                '<h3 class="definitionsHeader">',
                    '<span data-bind="text: Labels.HeaderAngleDisplayDefinitions"></span>',
                '</h3>',
                self.TemplateBaseClasses,
                self.TemplateQueryBlocks,
            '</div>',
            self.TemplateExecuteModelRole,
        '</div>',
        '<!-- /ko -->'
    ].join('');

    self.TemplateAngleInfoPopupHeader = [
        '<div class="AnglePopupHeader angleInformation">',
            '<div data-bind="css: { SignType2: Data().is_template, SignType1: !Data().is_template }"></div>',
            '<div data-bind="css: { SignFavorite: IsStarred(), SignFavoriteDisable: !IsStarred(), disabled: Data() && !Data().authorizations.update_user_specific }, click: $root.SetFavoriteItem"></div>',
            '<span data-bind="text: Name, attr: { title: Name }" class="Name"></span>',
            '<div data-bind="css: { none: Data().is_published, SignPrivate: !Data().is_published }"></div>',
            '<div class="SignValidated" data-bind="visible: Data().is_validated" style="display: none"></div>',
        '</div>'
    ].join('');

    self.TemplateDisplayInfoPopupHeader = [
        '<div class="displayPopupHeader displayNameContainer large">',
            '<div class="front">',
                '<i class="icon" data-bind="css: Data().display_type || \'new\'"></i>',
            '</div>',
            '<span class="name" data-bind="text: Name, attr: { title: Name }"></span>',
        '</div>'
    ].join('');

    self.TemplateDashboardInfoPopupHeader = [
        '<div class="angleInformation dashboardInformation">',
            '<div class="SignType3"></div>',
            '<div data-bind="css: { SignFavorite: Model.Data().user_specific.is_starred(), SignFavoriteDisable: !Model.Data().user_specific.is_starred(), disabled: !Model.Data().authorizations.update_user_specific }, click: SetFavorite"></div>',
            '<span data-bind="text: Model.Data().name(), title: Model.Data().name()" class="detailName"></span>',
            '<div data-bind="css: { none: Model.Data().is_published(), SignPrivate: !Model.Data().is_published() }"></div>',
            '<div class="SignValidated" data-bind="visible: Model.Data().is_validated()" style="display: none"></div>',
        '</div>'
    ].join('');
}
