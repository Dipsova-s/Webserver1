function FollowupsTemplate(handler) {
    "use strict";

    var self = this;
    self.Handler = handler;
    
    self.TemplatePopup = [
        '<div class="followupsArea initializing">',
            '<div class="followupsAreaInner">',
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
                    '<li class="flow forward">' + Localization.FollowupsHelpProcessFlow + '</li>',
                '</ul>',
                '<div class="followupButton fix">',
                    '<a class="btn btnPrimary disabled executing" onclick="followupPageHandler.ApplyFollowup()"><span>' + Localization.FollowupsButtonSubmit + '</span></a>',
                    '<div class="followupWarning">' + (self.Handler.HandlerFilter.FilterFor === self.Handler.HandlerFilter.FILTERFOR.ANGLE ? Localization.FollowupsWarningAngle : Localization.FollowupsWarningDisplay) + '</div>',
                '</div>',
            '</div>',
        '</div>',
        '<div class="followupsHelp">',
            '<div class="followupsHelpInner">',
                '<div class="helpHeaderContainer">&nbsp;</div>',
                '<div class="helpTextContainer">&nbsp;</div>',
            '</div>',
        '</div>'
    ].join('');
}
