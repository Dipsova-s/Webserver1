var saveDisplaysUsedInAutomationTasksHtmlTemplate = function () {
    return [
        '<div class="popupTabPanel" id="SaveDisplaysUsedInAutomationTasks">',
        '<div class="displayUsedInAutomationWarning">',
        '<span class="iconWarning">!</span>',
        '<span class="textWarning">' + Localization.DisplaysUsedInAutomationTextWarning + '</span>',
        '</div>',
        '<div class="displaysUsedInAutomationList">',
        '<!-- ko foreach: DisplaysInTask -->',
        '<!-- ko if: Tasks.length > 0 -->',
        '<div class="displayListItem">',
        '<label>',
        '<input type="checkbox" data-bind="value: DisplayUri,checked:$parent.CheckedDisplaysInTask, enable: $parent.TotalDisplaysCount() > 1">',
        '<span class="label">',
        '<i data-bind="attr: { \'class\': \'display-icon icon \' + DisplayTypeClassName }"></i>',
        '<span class="displayNameInTask" data-bind="text:Name"></span>',
        '</span > ',
        '</label>',
        '<div class="tasksList">',
        '<div class="taskHeading displayFlexVerCenter threeRowsWrapper">',
        '<span>Task</span>',
        '<span>Task Owner</span>',
        '<span></span>',
        '</div>',
        '<!-- ko foreach: Tasks -->',
        '<div class="taskListItem displayFlexVerCenter threeRowsWrapper">',
        '<span data-bind="text:Name"></span>',
        '<span data-bind="text:OwnerName"></span>',
        '<a class="iconHyperlink" title= "' + Localization.GoToScheduledTask + '" target="_blank" data-bind="css: {hide: url==\'\'},attr: { href: url }"></a>',
        '</div>',
        '<!-- /ko -->',
        '</div>',
        '</div>',
        '<!-- /ko -->',
        '<!-- /ko -->',
        '</div>',
        '</div>',
        '</div>'
    ].join('');
};



