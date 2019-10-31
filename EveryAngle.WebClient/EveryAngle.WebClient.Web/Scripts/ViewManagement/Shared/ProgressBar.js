var progressbarModel = new ProgressbarModel();

function ProgressbarModel() {
    "use strict";

    var self = this;
    var _rootElement = '.loader-container';
    var _percentageElement = '.loader-percentage';
    var _cancelElement = '.loader-cancel-button';

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
    self.CloseProgressBarPopup = function () {
        // if cancel user press cancel
        if (!self.CancelCustomHandler && !self.IsEndProgressBar) {
            if (WC.Ajax) {
                WC.Ajax.AbortAll();
            }
            if (self.IsSearchPage() || self.CancelForceStop) {
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

        jQuery(_rootElement).hide();
        self.IsEndProgressBar = false;
    };
    self.IsSearchPage = function () {
        return location.pathname.toLowerCase().indexOf(self.PAGE.SEARCH) !== -1;
    };
    self.EnableControl = function () {
        if (jQuery('#SelectedDisplay').length) {
            jQuery('#ActionDropdownList,#SelectedDisplay').removeClass('disabled');
        }
    };
    self.InitialProgressBar = function () {
        self.EndProgressBar();
    };
    self.ShowStartProgressBar = function (progressText, isShowRow) {
        self.CancelCustomHandler = false;
        self.CancelForceStop = false;
        self.IsEndProgressBar = false;

        self.CancelFunction = jQuery.noop;
        jQuery(_cancelElement).removeClass('alwaysHide');
        jQuery(_cancelElement).off('click').on('click', function () {
            self.CancelProgressBar();
        });

        self.UpdateZIndex();

        if (isShowRow) {
            self.SetProgressBarText('0', 0);
        }
        else {
            self.SetProgressBarText(null, null);
        }

        jQuery(_rootElement).show();
    };
    self.UpdateZIndex = function () {
        /* BOF: M4-13267: z-index of overlay & progress popup incorrect */
        var elements = jQuery('.k-window');
        if (elements.length) {
            var zIndex = 0;
            for (var loop = 0; loop < elements.length; loop++) {
                var elementZIndex = parseInt(jQuery(elements[loop]).css('zIndex')) || 10000;
                if (elementZIndex >= zIndex) {
                    zIndex = elementZIndex;
                }
            }


            jQuery(_rootElement).css({
                'zIndex': zIndex + 2
            });
        }
        /* EOF: M4-13267: z-index of overlay & progress popup incorrect */
    };

    self.EndProgressBar = function () {
        self.IsEndProgressBar = true;
        self.CloseProgressBarPopup();
    };
    self.GetPercentageValue = function (percentText) {
        var percentValue = parseInt(percentText);
        if (isNaN(percentValue)) {
            percentValue = 0;
        }
        return percentValue;
    };
    self.SetProgressBarText = function (percentText) {
        var progressPercent = jQuery(_percentageElement);
        if (!percentText) {
            progressPercent.hide();
        }
        else {
            // always show as integer
            var percentValue = self.GetPercentageValue(percentText);
            progressPercent.text(Math.min(percentValue, 100) + '%');
            progressPercent.show();
        }
        
    };
    self.SetDisableProgressBar = function () {
        jQuery(_cancelElement).addClass('alwaysHide');
    };
    self.CancelProgressBar = function () {
        self.IsCancelPopup = true;
        self.EnableControl();
        if (!jQuery(_cancelElement).hasClass('alwaysHide') && !self.CancelFunction.call()) {
            self.CloseProgressBarPopup();
        }
    };
    //EOF: View model methods

}
