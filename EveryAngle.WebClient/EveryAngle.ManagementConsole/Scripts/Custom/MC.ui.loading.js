(function (win) {

    var loading = {
        loader: '#loading',
        type: 1,
        TYPE: {
            upload: 2,
            normal: 1,
            error: 0,
            info: 3
        },
        handleByUser: false,

        // request that less than "smallLoadingTime" (in milliseconds) will not be shown
        smallLoadingTime: 100,

        fnPreventSmallLoading: null,
        init: function () {
            MC.addPageReadyFunction(this.createLoading);
        },
        createLoading: function () {
            if (!jQuery('.loading').length) {
                var oLoading = jQuery('<div />').attr({
                    'id': MC.ui.loading.loader.substr(1),
                    'class': 'loading'
                });
                jQuery('<div class="loadingOverlay" />').appendTo(oLoading);
                var content = jQuery('<div class="loadingContent" />');
                jQuery('<a class="loadingClose" />').appendTo(content);
                jQuery('<span class="loadingContentText" />').appendTo(content);
                content.appendTo(oLoading);
                jQuery(oLoading).appendTo('body');
            }

            jQuery('.loadingClose').click(function () {
                MC.ui.loading.handleByUser = false;
                MC.ui.loading.hide(true);
                return false;
            });
        },
        setError: function (msg) {
            this.type = this.TYPE.error;
            this.setLoader('typeError');
            jQuery('.loadingContentText', this.loader).html(msg);
        },
        setInfo: function (msg) {
            this.type = this.TYPE.info;
            this.setLoader('typeInfo');
            jQuery('.loadingContentText', this.loader).html(msg);
        },
        setLoader: function (newClass, styles) {
            if (typeof newClass !== 'undefined' && newClass != null)
                jQuery(this.loader).attr('class', 'loading ' + newClass);
            if (typeof styles !== 'undefined')
                jQuery(this.loader).css(styles);
        },
        setUpload: function (xhr) {
            var onUploadCancel = function (e) {
                if (MC.ui.loading.type == MC.ui.loading.TYPE.upload) {
                    MC.util.showPopupConfirmation(Localization.MC_UploadFileRunningPopup, function () {
                        if (e.type != 'beforeunload') $(window).off('beforeunload');

                        MC.ui.loading.clearUpload();

                        xhr.abort();
                    });
                }
            };

            this.type = this.TYPE.upload;
            this.setLoader('loadingProgress');

            var progressStatus = $('<div class="loadingProgressStatus"><i></i></div><div class="loadingProgressStatusText">' + Localization.MC_UploadInprogress + '</div>'),
                cancelButton = $('<a class="btn" />').html(Captions.Button_Cancel).click(function (e) {
                    onUploadCancel(e);
                    return false;
                });
            $('.loadingContentText', this.loader).empty().append(progressStatus).append(cancelButton);
            this.setUploadStatus({ percent: 0, loaded: 0, total: 0 });

            jQuery(window).on('beforeunload', function (e) {
                onUploadCancel(e);
                return;
            });
        },
        setUploadStatus: function (e) {
            jQuery('.loadingProgressStatus > i', this.loader).width(e.percent + '%');

            var statusText;
            if (e.percent == 100)
                statusText = Localization.MC_UploadSuccessful;
            else if (Modernizr.xhr2)
                statusText = e.percent + '% (' + Math.floor(e.loaded / 1024) + ' of ' + Math.floor(e.total / 1024) + ' KB)';
            else
                statusText = Localization.MC_UploadInprogress;

            jQuery('.loadingProgressStatusText', this.loader).text(statusText);
        },
        clearUpload: function () {
            this.type = this.TYPE.normal;
            this.hide(true);
            $(window).off('beforeunload');
        },
        show: function () {
            if (this.type == this.TYPE.error)
                return;

            jQuery(this.loader).removeClass('typeError typeInfo')
                .find('.loadingClose').off('click.close');

            var self = this;
            this.fnPreventSmallLoading = setTimeout(function () {
                jQuery(self.loader).show();
                fnPreventSmallLoading = null;
            }, this.smallLoadingTime);
        },
        showAndHide: function () {
            MC.ui.loading.show();
            setTimeout(function () {
                MC.ui.loading.hide();
            }, 500);
        },
        hide: function (force) {
            if (this.type == this.TYPE.upload || this.handleByUser)
                return;

            if (typeof (force) == 'undefined')
                force = false;

            if ((this.type == this.TYPE.error) && !force)
                return;

            if (this.fnPreventSmallLoading != null) {
                clearTimeout(this.fnPreventSmallLoading);
                this.fnPreventSmallLoading = null;
            }
            this.handleByUser = false;
            this.type = this.TYPE.normal;
            jQuery(this.loader).hide().attr({ 'class': 'loading', 'style': '' })
                .find('.loadingContentText').empty();
        }
    };

    win.MC.ui.loading = loading;
    win.MC.ui.loading.init();

})(window);
