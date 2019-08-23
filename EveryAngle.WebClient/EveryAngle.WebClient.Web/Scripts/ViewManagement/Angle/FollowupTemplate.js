function FollowupsTemplate(handler) {
    "use strict";

    var self = this;
    self.Handler = handler;
    self.TemplatePopup = [
        '<div class="followupsArea initializing box-scrollable">',
            '<div class="followupsAreaInner box-scrollable-content">',
                '<div class="followupBlock ' + self.Handler.CATEGORY.UP.Code + '"></div>',
                '<div class="followupBlock ' + self.Handler.CATEGORY.DOWN.Code + '"></div>',
                '<div class="followupBlock ' + self.Handler.CATEGORY.LEFT.Code + '"></div>',
                '<div class="followupBlock ' + self.Handler.CATEGORY.RIGHT.Code + '"></div>',
                '<div class="followupClass blockHeader"></div>',
                '<div class="followupRelation manyToOne"></div>',
                '<div class="followupRelation manyToOne"></div>',
                '<div class="followupFlow forward"></div>',
                '<div class="followupFlow forward"></div>',
                '<ul class="followupsIndicator fix">',
                    '<li class="relation manyToOne">' + Localization.FollowupsHelpManyToOneRelation + '</li>',
                '</ul>',
            '</div>',
        '</div>',
        '<div class="followupsHelp">',
            '<div class="box-scrollable">',
                '<div class="followupsHelpInner box-scrollable-content">',
                    '<div class="helpHeaderContainer">&nbsp;</div>',
                    '<div class="helpTextContainer">&nbsp;</div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');
}
