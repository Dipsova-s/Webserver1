var progressbarModel = new ProgressbarModel();

function ProgressbarModel() {
    "use strict";

    var self = this;
    //BOF: View model properties
    self.CancelCustomHandler = false;
    self.IsCancelPopup = false;
    self.CancelForceStop = false;
    self.CancelFunction = jQuery.noop;
    self.KeepCancelFunction = false;
    self.IsEndProgressBar = false;
    self.ReferenceUri = WC.Page.GetPreviousPageUrl();
    self.PAGE = {
        SEARCH: typeof searchPageUrl === 'undefined' ? null : searchPageUrl.toLowerCase(),
        ANGLE: typeof anglePageUrl === 'undefined' ? null : anglePageUrl.toLowerCase(),
        DASHBOARD: typeof dashboardPageUrl === 'undefined' ? null : dashboardPageUrl.toLowerCase()
    };
    //EOF: View model properties

    //BOF: View model methods
    var closeProgressBarPopup = function () {
        // if cancel user press cancel
        if (!self.CancelCustomHandler && !self.IsEndProgressBar) {
            if (WC.Ajax) {
                WC.Ajax.AbortAll();
            }
            if (location.pathname.toLowerCase().indexOf(self.PAGE.SEARCH) !== -1 || self.CancelForceStop) {
                if (window.stop) {
                    window.stop();
                }
                else if (document.execCommand) {
                    document.execCommand('Stop');
                }
            }
            else if (self.ReferenceUri.indexOf('redirect=') !== -1) {
                if (typeof anglePageHandler !== 'undefined') {
                    anglePageHandler.BackToSearch();
                }
                else if (typeof dashboardHandler !== 'undefined') {
                    dashboardHandler.BackToSearch();
                }
            }
            else {
                window.history.back();
            }
        }

        if (window.kendo) {
            var progressPopup = jQuery('#popupProgressBar').data('kendoWindow');
            if (progressPopup) {
                progressPopup.close();
            }
            else {
                jQuery('#PopupProgressBarwrapper').hide();
                jQuery('.k-overlay').remove();
            }
        }
        else {
            jQuery('#PopupProgressBarwrapper').hide();
            jQuery('.k-overlay').remove();
        }

        self.IsEndProgressBar = false;
    };
    var enableControl = function () {
        if (jQuery('#SelectedDisplay').length) {
            jQuery('#ActionDropdownList,#SelectedDisplay').removeClass('disabled');
        }
    };
    self.InitialProgressBar = function () {
        if (window.kendo) {
            var progressPopup = jQuery('#popupProgressBar').data('kendoWindow');
            if (!progressPopup) {
                progressPopup = jQuery('#popupProgressBar').kendoWindow({
                    draggable: false,
                    resizable: false,
                    animation: false,
                    modal: true,
                    visible: false
                }).data('kendoWindow');
            }

            self.EndProgressBar();

            return progressPopup;
        }
    };
    self.ShowStartProgressBar = function (progressText, isShowRow) {
        if (typeof progressText === 'undefined') {
            progressText = Localization.ProgressBar_PleaseWait;
        }
        self.CancelCustomHandler = false;
        self.CancelForceStop = false;
        self.IsEndProgressBar = false;

        self.CancelFunction = jQuery.noop;
        jQuery('#CancelProgress')
            .removeClass('disabled')
            .off('click')
            .on('click', function () {
                self.CancelProgressBar();
            });

        if (window.kendo) {
            var progressPopup = jQuery('#popupProgressBar').data('kendoWindow');
            if (!progressPopup) {
                progressPopup = self.InitialProgressBar();
            }
            progressPopup.wrapper.css('opacity', 1);
            progressPopup.open();
            progressPopup.toFront();

            var progressbar = jQuery('#ProgressBar').data('kendoProgressBar');
            if (!progressbar) {
                jQuery('#ProgressBar').kendoProgressBar({ value: 0, animation: false });
            }
        }
        else {
            /* BOF: M4-13267: z-index of overlay & progress popup incorrect */
            var elements = jQuery('.k-window');
            var zIndex = 0;
            for (var loop = 0; loop < elements.length; loop++) {
                var elementZIndex = parseInt(jQuery(elements[loop]).css('zIndex')) || 10000;
                if (elementZIndex >= zIndex) {
                    zIndex = elementZIndex;
                }
            }

            var overlay = jQuery('.k-overlay');
            if (!overlay.length) {
                overlay = jQuery('<div class="k-overlay"/>').appendTo('body');
            }

            jQuery('#PopupProgressBarwrapper').css({
                'zIndex': zIndex + 2,
                'opacity': 1
            });
            overlay.css('zIndex', zIndex + 1);
            /* EOF: M4-13267: z-index of overlay & progress popup incorrect */

            jQuery('#PopupProgressBarwrapper, .k-overlay').show();
        }

        if (isShowRow) {
            self.SetProgressBarText('0', 0, progressText);
        }
        else {
            self.SetProgressBarText(null, null, progressText);
        }
    };

    self.EndProgressBar = function () {
        self.IsEndProgressBar = true;
        closeProgressBarPopup();
    };
    self.GetPercentageValue = function (percentText) {
        var percentValue = parseInt(percentText);
        if (isNaN(percentValue)) {
            percentValue = 0;
        }
        return percentValue;
    };
    self.SetProgressBarText = function (percentText, queryRows, progressText) {
        var progressbar = jQuery('#ProgressBar').data('kendoProgressBar');
        var progressPercent = jQuery('#ProgressPercent');
        if (percentText === null && queryRows === null) {
            if (progressbar) {
                progressbar.progressWrapper.width(0);
                progressbar.progressWrapper.children().width(0);
                progressbar.value(0);
            }
            progressPercent.hide();
        }
        else {
            // always show as integer
            var percentValue = self.GetPercentageValue(percentText);

            progressPercent.show();
            if (queryRows === null) {
                progressPercent.text(percentValue + '%');
            }
            else {
                progressPercent.text(percentValue + '% (' + queryRows + ' ' + Localization.ProgressBar_CurrentRows + ')');
            }

            if (progressbar) {
                if (percentValue === 0) {
                    progressbar.progressWrapper.width(0);
                    progressbar.progressWrapper.children().width(0);
                }
                progressbar.value(percentValue);
            }
        }

        jQuery('#ProgressText').empty();
        if (typeof progressText !== 'undefined') {
            jQuery('#ProgressText').text(progressText);
        }
    };
    self.SetDisableProgressBar = function () {
        jQuery('#CancelProgress').addClass('disabled');
    };
    self.CancelProgressBar = function () {
        self.IsCancelPopup = true;
        enableControl();
        if (!jQuery('#CancelProgress').hasClass('disabled') && !self.CancelFunction.call()) {
            closeProgressBarPopup();
        }
    };
    //EOF: View model methods
}
