(function (win) {

    var loading = {

        loader: '#LoaderContainer',

        loaderSpinnerContainer: '#LoaderContainer .loader-container',        
        loaderPercentage: '#LoaderContainer .loader-percentage',
        loaderCloseButton: '#LoaderContainer .loader-cancel-button',

        loaderMessageContainer: '#LoaderContainer .loader-message',
        loaderMessageText: '#LoaderContainer .loader-message-text',

        TYPE: { error: 0, normal: 1, upload: 2, info: 3 },
        type: null,

        handleByUser: false,

        // request that less than "smallLoadingTime" (in milliseconds) will not be shown
        smallLoadingTime: 100,
        fnPreventSmallLoading: null,

        init: function () {
            MC.addPageReadyFunction(this.setup.bind(this));
        },
        setup: function () {
            var self = this;
            this.type = this.TYPE.normal;
            jQuery(this.loaderCloseButton).click(function () {
                self.handleByUser = false;
                self.hide(true);
                return false;
            });
        },

        setError: function (msg) {
            this.type = this.TYPE.error;
            this.setLoader('typeError');
            jQuery(this.loaderMessageText).html(msg);
        },
        setInfo: function (msg) {
            this.type = this.TYPE.info;
            this.setLoader('typeInfo');
            jQuery(this.loaderMessageText).html(msg);
        },
        setLoader: function (newClass) {
            if (newClass) {
                jQuery(this.loaderMessageContainer).addClass(newClass);

                if (['typeError', 'typeInfo'].indexOf(newClass) !== -1) {
                    jQuery(this.loaderSpinnerContainer).hide();
                    jQuery(this.loaderMessageContainer).show();
                }
            }
        },

        setUpload: function (xhr) {
            var self = this;
            var onUploadCancel = function (e) {
                if (self.type !== self.TYPE.upload)
                    return;

                MC.util.showPopupConfirmation(Localization.MC_UploadFileRunningPopup, function () {
                    if (e.type !== 'beforeunload')
                        jQuery(window).off('beforeunload');

                    self.clearUpload();
                    xhr.abort();
                });
            };

            this.type = this.TYPE.upload;

            jQuery(this.loaderCloseButton).off('click.close').one('click.close', function (e) {
                onUploadCancel(e);
                return false;
            });

            this.setUploadStatus();

            jQuery(window).on('beforeunload', function (e) {
                onUploadCancel(e);
                return;
            });
        },
        setUploadStatus: function (percentage) {
            jQuery(this.loaderPercentage).text((percentage || 0) + '%');
        },
        clearUpload: function () {
            this.type = this.TYPE.normal;
            this.hide(true);
            jQuery(window).off('beforeunload');
        },

        show: function () {
            var self = this;

            if (this.type === this.TYPE.error)
                return;

            jQuery(this.loaderSpinnerContainer).show();
            jQuery(this.loaderMessageContainer).hide();

            clearTimeout(this.fnPreventSmallLoading);
            this.fnPreventSmallLoading = setTimeout(function () {
                jQuery(self.loader).show();
            }, this.smallLoadingTime);
        },
        showAndHide: function () {
            var self = this;
            this.show();
            setTimeout(function () {
                self.hide();
            }, 500);
        },
        hide: function (force) {
            if (this.type === this.TYPE.upload || this.handleByUser)
                return;

            if (typeof force === 'undefined')
                force = false;

            if (this.type === this.TYPE.error && !force)
                return;

            clearTimeout(this.fnPreventSmallLoading);
            this.handleByUser = false;
            this.type = this.TYPE.normal;
            jQuery(this.loader).hide();
            jQuery(this.loaderPercentage).text('');
            jQuery(this.loaderCloseButton).off('click.close');
            jQuery(this.loaderMessageContainer).removeClass('typeError typeInfo');
            jQuery(this.loaderSpinnerContainer + ',' + this.loaderMessageContainer).removeClass('alwaysHidden');
        },

        disableLoaderSpinner: function () {
            jQuery(this.loaderSpinnerContainer).addClass('alwaysHidden');
        },
        disableLoaderMessage: function () {
            jQuery(this.loaderMessageContainer).addClass('alwaysHidden');
        }
    };

    win.MC.ui.loading = loading;
    win.MC.ui.loading.init();

})(window);
