var scheduleAngleHtmlTemplate = function () {
    return [
        '<div class="scheduleAngleArea">',
            '<input id="taskDropdownList" class="k-dropdown" />',
        '<span class="loader-spinner-inline alwaysHide">' + getLoadingIconSvg() + '</span>',
        '</div>',
        '<div class="scheduleAngleArea scheduleAngleAreaInfo">'+ Localization.ToOpenMC +'</div>'
    ].join('');
};
