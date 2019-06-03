(function (win, globalSettings) {

    function WelcomePage() {
        var self = this;
        self.WelcomeData = {};
        self.VideosNoThumbnailData = [];
        self.SaveVideoThumbnailUri = '';

        self.Initial = function (data) {
            self.SaveVideoThumbnailUri = '';
            self.WelcomeData = {};
            self.VideosNoThumbnailData = [];
            jQuery.extend(self, data || {});

            setTimeout(function () {
                self.CheckVideoThumbnail();

                $('textarea.k-raw-content').each(function () {
                    var editor = $(this).data('kendoEditor');
                    if (editor) {
                        editor.bind('execute', function (e) {
                            if (e.name === 'createlink') {
                                setTimeout(function () {
                                    var label = jQuery('#k-editor-link-target').next('label').removeAttr('class'),
                                        labelText = label.text();
                                    label.empty();
                                    label.append(jQuery('#k-editor-link-target').attr('checked', 'checked'));
                                    label.append('<span class="label">' + labelText + '</span>');
                                }, 1);
                            }

                            if (e.name === 'createlink' || e.name === 'insertimage') {
                                setTimeout(function () {
                                    jQuery('.k-dialog-insert').attr('class', 'btn btnPrimary');
                                    jQuery('.k-dialog-close').attr('class', 'btn');
                                }, 1);
                            }
                        });
                    }
                });

                $('#SelectWelcomeLanguage').kendoDropDownList();

                self.SetWelcomeDataToUI($('#SelectWelcomeLanguage').val());

                MC.form.page.init(self.GetData);
            }, 1);
        };

        self.CheckVideoThumbnail = function () {
            var button = jQuery('#pageToolbarButton .btnGenerateThumbnails');
            if (self.VideosNoThumbnailData.length) {
                button.removeClass('disabled').append('<i>' + self.VideosNoThumbnailData.length + '</i>');
            }
            else {
                button.addClass('disabled').children('i').remove();
            }
        };

        self.ChangeWelcomeLanguage = function (obj) {
            if (!jQuery('#WelcomPageForm').valid()) {
                obj.value = $(obj).data('default');
                return false;
            }

            self.SetUIToWelcomeData($(obj).data('default'));

            self.SetWelcomeDataToUI(obj.value);
        };

        self.SetUIToWelcomeData = function (lang) {
            var found = false, editor;
            $.each(self.WelcomeData.introductiontexts, function (index, value) {
                if (value.lang === lang) {
                    editor = $('#IntroductionText').data('kendoEditor');
                    if (editor) {
                        value.text = $.trim(editor.value());
                        found = true;
                    }
                    return false;
                }
            });
            if (!found) {
                editor = $('#IntroductionText').data('kendoEditor');
                if (editor) {
                    self.WelcomeData.introductiontexts.push({
                        lang: lang,
                        text: $.trim(editor.value())
                    });
                }
            }

            found = false;
            $.each(self.WelcomeData.newstexts, function (index, value) {
                if (value.lang === lang) {
                    editor = $('#NewsText').data('kendoEditor');
                    if (editor) {
                        value.text = $.trim(editor.value());
                        found = true;
                    }
                    return false;
                }
            });
            if (!found) {
                editor = $('#NewsText').data('kendoEditor');
                if (editor) {
                    self.WelcomeData.newstexts.push({
                        lang: lang,
                        text: $.trim(editor.value())
                    });
                }
            }

            found = false;
            $.each(self.WelcomeData.movielinktitles, function (index, value) {
                if (value.lang === lang) {
                    value.text = $.trim($('#MovieLinkTitle').val());
                    found = true;
                    return false;
                }
            });
            if (!found) {
                self.WelcomeData.movielinktitles.push({
                    lang: lang,
                    text: $.trim($('#MovieLinkTitle').val())
                });
            }

            self.WelcomeData.companylogo = $('#CompanyLogoPreview').attr('src');
        };

        self.SetWelcomeDataToUI = function (lang) {
            $('#SelectWelcomeLanguage').data('default', lang).val(lang);

            var found = false;
            var editor = $('#IntroductionText').data('kendoEditor');
            if (editor) {
                $.each(self.WelcomeData.introductiontexts, function (index, value) {
                    if (value.lang === lang) {
                        editor.value(value.text);
                        found = true;
                        return false;
                    }
                });
                if (!found) {
                    editor.value('');
                }
            }

            found = false;
            editor = $('#NewsText').data('kendoEditor');
            if (editor) {
                $.each(self.WelcomeData.newstexts, function (index, value) {
                    if (value.lang === lang) {
                        editor.value(value.text);
                        found = true;
                        return false;
                    }
                });
                if (!found) {
                    editor.value('');
                }
            }

            found = false;
            $.each(self.WelcomeData.movielinktitles, function (index, value) {
                if (value.lang === lang) {
                    $('#MovieLinkTitle').val(value.text);
                    found = true;
                    return false;
                }
            });
            if (!found) {
                $('#MovieLinkTitle').val('');
            }


            $('#MovieLinkUrl').val(self.WelcomeData.movielinkurl);
            $('#CompanyLogoPreview').attr('src', self.WelcomeData.companylogo + '?v=' + jQuery.now()).data('default', self.WelcomeData.companylogo);
        };

        self.SetAllLogo = function () {
        };

        self.SetAllNews = function () {
            var editor = $('#NewsText').data('kendoEditor');
            if (editor) {
                var text = editor.value();
                $.each(self.WelcomeData.newstexts, function (index, value) {
                    value.text = text;
                });
            }
        };

        self.ShowLogoPreview = function (event) {
            var input = event.target || event.srcElement || event.sender.element[0],
                preview = jQuery(input).parents('.contentSectionWelcomeLogoItem').children('img'),
                defaultImage = preview.data('default') || 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            if (!input.value || (jQuery.validator && !jQuery(input).valid())) {
                if (window.FileReader)
                    preview.attr('src', defaultImage);
                else
                    preview[0].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = '';
                jQuery(input).replaceWith(jQuery(input).clone(true));
                event.preventDefault();
                return false;
            }

            MC.util.previewImage(input, preview, defaultImage);
        };

        self.GetData = function () {
            MC.form.clean();

            self.WelcomeData.movielinkurl = $('#MovieLinkUrl').val();

            self.SetUIToWelcomeData($('#SelectWelcomeLanguage').val());
            if ($('#ApplyLogoAllLanguages').is(':checked')) {
                self.SetAllLogo();
            }
            if ($('#ApplyNewsAllLanguages').is(':checked')) {
                self.SetAllNews();
            }

            return jQuery.extend({}, self.WelcomeData);
        };

        self.SaveWelcomePage = function () {
            MC.form.clean();

            if (!jQuery('#WelcomPageForm').valid()) {
                jQuery('#WelcomPageForm .error:first').focus();
                return false;
            }

            var data = self.GetData();

            document.getElementById('WebclientsettingsData').value = JSON.stringify(data);
            MC.util.ajaxUpload('#WelcomPageForm', {
                successCallback: function () {
                    MC.ajax.reloadMainContent();
                },
                completeCallback: function () {
                    MC.util.ajaxUploadClearInput('#companyLogo');
                }
            });
        };

        self.GenerateVideoThumbnails = function () {
            if (!self.VideosNoThumbnailData.length)
                return;

            MC.ui.loading.show();
            if (!Modernizr.video.h264 || !Modernizr.canvas) {
                MC.ui.loading.setError(MC.util.massReport.createMessage(Localization.MC_BrowserNotSupport, ''));
                return;
            }

            var video;
            var reports = [];
            var delayTime = 100;
            var index = 0;

            var setFrameTime = function () {
                var timeFrame = Math.min(3, this.duration / 2);

                if (timeFrame !== this.currentTime) {
                    this.currentTime = timeFrame;
                    this.pause();
                }
            };
            var nextVideo = function (delay) {
                if (typeof delay === 'undefined')
                    delay = 0;

                setTimeout(function () {
                    var videoObject = jQuery(video);
                    videoObject.off('canplay');
                    video.pause();

                    if (self.VideosNoThumbnailData[index]) {
                        videoObject.on('canplay', setFrameTime);
                        video.src = self.VideosNoThumbnailData[index];
                        video.load();
                        video.play();
                        index++;
                    }
                    else {
                        // show reports
                        $(video).remove();
                        setTimeout(function () {
                            MC.util.massReport.showReport(Localization.MC_GenerateThumbnailsReport);
                        }, 100);
                    }
                }, delay);
            };
            var onError = function (e) {
                var filename = video.getAttribute('src').split('/');
                filename = '/' + filename.slice(filename.length - 4).join('/');
                var reportIndex = reports.length;

                switch (e.target.error.code) {
                    case e.target.error.MEDIA_ERR_ABORTED:
                        MC.util.massReport.setReport(reportIndex, false, filename, Localization.MC_AbortedVideoPlayback);
                        break;
                    case e.target.error.MEDIA_ERR_NETWORK:
                        MC.util.massReport.setReport(reportIndex, false, filename, Localization.MC_VideoDownloadFail);
                        break;
                    case e.target.error.MEDIA_ERR_DECODE:
                        MC.util.massReport.setReport(reportIndex, false, filename, Localization.MC_VideoPlaybackAborted);
                        break;
                    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        MC.util.massReport.setReport(reportIndex, false, filename, Localization.MC_VideoNotLoaded);
                        break;
                    default:
                        MC.util.massReport.setReport(reportIndex, false, filename, Localization.MC_VideoUnknownError);
                        break;
                }

                MC.util.massReport.setStatus(Localization.MC_File, filename, 'fail');

                nextVideo(delayTime);
            };
            var getThumb = function () {
                if (reports[index - 1])
                    return;

                var filename = video.getAttribute('src').split('/');
                filename = '/' + filename.slice(filename.length - 4).join('/');
                var reportIndex = index - 1;
                var maxW = 500;
                var w = maxW;
                var h = maxW * video.videoHeight / video.videoWidth;
                var canvas = document.createElement('canvas');

                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, w, h);

                MC.util.massReport.setStatus(Localization.MC_File, filename, Localization.MC_Generating);
                var matches = /data:([^;]*);base64,(.*)/g.exec(canvas.toDataURL('image/jpg'));
                if (!matches) {
                    MC.util.massReport.setStatus(Localization.MC_File, filename, Localization.MC_ExtractionFailed);
                    MC.util.massReport.setReport(reportIndex, false, filename, Localization.MC_ImageExtractionFailed);
                    nextVideo(delayTime);
                }
                else {
                    MC.util.massReport.setReport(reportIndex, false, filename, Localization.MC_ThumbUnknownError);

                    var data = matches[2];
                    var deferred = jQuery.Deferred();
                    MC.ajax.request({
                        url: self.SaveVideoThumbnailUri,
                        type: 'POST',
                        parameters: { dataImage: data, pathVideo: video.getAttribute('src') }
                    })
                        .done(function (data, status, xhr) {
                            MC.util.massReport.onDone(arguments, deferred, Localization.MC_File, filename, reportIndex);
                        })
                        .fail(function (xhr, status, error) {
                            MC.util.massReport.onFail(arguments, deferred, Localization.MC_File, filename, reportIndex);
                        })
                        .always(function () {
                            nextVideo(delayTime);
                        });

                    deferred.promise();
                }
            };

            video = jQuery('<video id="video" src="" controls="controls" preload="none"></video>')
                .on('error', onError)
                .on('seeked', getThumb);
            video.appendTo('body');
            video = video.get(0);

            MC.util.massReport.initial();
            nextVideo();
        };
    }

    win.MC.GlobalSettings = globalSettings || {};
    jQuery.extend(win.MC.GlobalSettings, {
        WelcomePage: new WelcomePage()
    });

})(window, MC.GlobalSettings);
