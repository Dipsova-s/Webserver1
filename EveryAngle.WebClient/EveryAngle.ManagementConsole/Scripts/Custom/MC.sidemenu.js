(function (win) {

    var sideMenu = {
        activeClass: 'active',
        isBusy: false,
        fnCheckFirstAddressChange: null,
        init: function () {
            MC.addPageReadyFunction(this.setFitHeight);
            MC.addPageResizeFunction(this.setFitHeight);

            jQuery.address.change(MC.sideMenu.urlChanged);

            MC.sideMenu.fnCheckFirstAddressChange = setTimeout(function () {
                jQuery.address.update();
            }, 1000);
        },
        urlChanged: function (event) {
            clearTimeout(MC.sideMenu.fnCheckFirstAddressChange);

            // if upload file come here then stop it
            if (MC.ui.loading.type === MC.ui.loading.TYPE.upload)
                return false;

            // jump to the first linked menu
            if (event.value === '/') {
                MC.sideMenu.redirectToFirstLink();
                return false;
            }

            var path = unescape(event.path);
            var target = event.pathNames;
            var parent = jQuery('#sideMenu');
            var current = parent.find('[href="#' + path + '"]').parent();
            var brokenLinkIndex = -1;

            // check path
            if (!current.length) {
                jQuery.each(target, function (index, pathName) {
                    // skip
                    if (!pathName)
                        return true;

                    pathName = unescape(pathName);
                    var currentMenu = parent.find(".sideMenuLabel:contains('" + pathName + "')").parent('a').parent('li');
                    if (currentMenu.length) {
                        current = currentMenu;
                        parent = current;
                    }
                    else {
                        brokenLinkIndex = index;
                        return false;
                    }
                });
            }

            // not found then go to the first linked menu
            if (!current.length) {
                MC.sideMenu.redirectToFirstLink();
                return false;
            }

            // found linked menu
            if (brokenLinkIndex !== -1) {
                // link is broken
                location.hash = '#/' + target.slice(0, brokenLinkIndex).join('/') + '/';
                return false;
            }

            // link is ok
            jQuery('.k-wc, .k-overlay').hide();
            if (jQuery('>a', current).data('url')) {
                // has url to request
                var link = jQuery('>a', current).get(0);
                MC.sideMenu.load(link);
            }
            else {
                // no url to request

                // set active menu
                jQuery('>a', current).parents('li').addClass(MC.sideMenu.activeClass);

                // load first linked page if reload page
                // e.g. now in #/Models/ but this will show overview content (the first link)
                if (MC.ajax.lastMainContentRequest === null) {
                    var firstLinkable = MC.sideMenu.getFirstLink();
                    MC.sideMenu.load(firstLinkable.get(0));
                }
            }
        },
        setFitHeight: function () {
            var height;
            if (!!$.browser.safari && Modernizr.touch && document.documentElement.clientWidth / window.innerWidth === 1) {
                height = window.innerHeight;
            }
            else {
                height = MC.util.window.height;
            }
            jQuery('#sideContent').height(height - 60);
        },
        setBreadcrumb: function (obj) {
            MC.ui.breadcrumb.render(obj);
        },
        getFirstLink: function () {
            return jQuery('#sideMenu a[data-url]').filter(function () { return jQuery(this).data('url'); }).first();
        },
        redirectToFirstLink: function () {
            var link = MC.sideMenu.getFirstLink();
            link.trigger('click');
        },
        getDeepLink: function (obj) {
            this.setActive(obj);

            var url = [];
            jQuery(obj).parents('li.active').each(function (k, v) {
                url.splice(0, 0, jQuery('>a .sideMenuLabel', v).text());
            });

            return url.length === 0 ? '/' : '/' + url.join('/') + '/';
        },
        setDeepLink: function (url) {
            jQuery.address.value(url);
        },
        click: function (e, obj) {
            var self = this;
            var hasLink = !!jQuery(obj).data('url');
            var currentUrl = jQuery.address.value();
            var url = '';
            var onClick = function () {
                if (jQuery(obj).next('ul:not(.alwaysHidden)').length) {
                    // next element has <ul> then toggle menu
                    self.toggle(obj, function (obj) {
                        url = self.getDeepLink(obj);
                        if (currentUrl !== url) {
                            self.setDeepLink(url);
                        }
                        else if (hasLink) {
                            self.load(obj);
                        }
                    });
                }
                else {
                    url = self.getDeepLink(obj);
                    if (currentUrl !== url) {
                        self.setDeepLink(url);
                    }
                    else if (hasLink) {
                        self.load(obj);
                    }
                }
            };

            if (!self.isBusy) {
                if (!hasLink) {
                    onClick();
                }
                else {
                    MC.form.page.checkChange(onClick);
                }
            }

            MC.util.preventDefault(e);
        },
        load: function (obj) {
            MC.system.abort();
            MC.form.page.clear();
            MC.form.page.clearStates();

            var title = jQuery('.sideMenuLabel', obj).text();
            if (title !== 'Overview') {
                this.setActive(obj);
            }
            else {
                title = 'Management Console Overview';
            }

            var fnCheckMainPageToolbar;
            var params = jQuery.address.parameter('parameters');
            var req = {
                element: obj,
                target: '#mainContent',
                ajaxStart: function () {
                    clearTimeout(fnCheckMainPageToolbar);
                    disableLoading();

                    jQuery('#mainContent').removeClass('errorMainContent').addClass('loadingMainContent');
                    kendo.ui.progress($('#mainContent'), true);

                    var pageToolbar = jQuery('#mainContainer .contentInner').children('.pageToolbar');
                    if (pageToolbar.length) {
                        pageToolbar.find('.pageToolbarButton').remove();
                        jQuery('#pageTitle').html(title);
                    }
                },
                ajaxSuccess: function (metadata) {
                    // remove loading
                    jQuery('#mainContent').removeClass('loadingMainContent');
                    kendo.ui.progress($('#mainContent'), false);

                    // move page toolbar
                    jQuery('#mainContainer .contentInner').children('.pageToolbar').remove();
                    jQuery('#mainContainer .contentInner').append(jQuery('#mainContent .pageToolbar'));
                    jQuery('#mainContainer .pageToolbarButton').addClass('hidden');
                    fnCheckMainPageToolbar = setTimeout(function () {
                        jQuery('#mainContainer .pageToolbarButton').removeClass('hidden');
                    }, 500);

                    // set breadcrumb
                    MC.sideMenu.setBreadcrumb(metadata.element);

                    // set page title
                    jQuery('#pageTitle').html(title);

                    // set content height
                    if (MC.sideMenu)
                        MC.sideMenu.setFitHeight();
                    if (MC.content)
                        MC.content.adjustContent();
                }
            };

            if (params) {
                try {
                    req.parameters = JSON.parse(unescape(params));
                }
                catch (e) {
                    // do nothing
                }
            }

            MC.ajax.request(req)
                .fail(function (xhr, status, error) {
                    if (error.toLowerCase().indexOf('timeout') !== -1) {
                        MC.ui.loading.hide(true);
                        error = Localization.HTTP_408_Timeout;
                        xhr.status = 408;
                        xhr.responseText = JSON.stringify({
                            reason: error,
                            message: Localization.HTTP_408_Server_Currently_Busy
                        });
                        MC.ajax.setErrorDisable(xhr, status, error);
                        var msg = MC.ajax.getErrorMessage(xhr, null, error);
                        msg += '<a class="btn" onclick="$.address.update()">' + Localization.Retry + '</a>';
                        jQuery('#mainContent').html('<div class="content"><div class="contentSection contentSectionError">' + msg + '</div></div>');
                    }
                    else {
                        jQuery('#mainContent').addClass('errorMainContent');
                    }
                })
                .always(function () {
                    jQuery('#mainContent').removeClass('loadingMainContent');
                    kendo.ui.progress($('#mainContent'), false);
                });
        },
        setActive: function (obj) {
            jQuery('#sideMenu li').removeClass(this.activeClass);
            jQuery(obj).parents('li').addClass(this.activeClass);
        },
        toggleSeed: null,
        toggle: function (obj, callback) {
            var self = this;
            var hasLink = !!jQuery(obj).data('url');
            var isOpened = jQuery(obj).parent('li.' + self.activeClass).length;

            // close all menu
            jQuery(obj).parents('ul:first').find('>li').each(function (k, v) {
                if (jQuery(v).children('a').next('ul').length
                    && jQuery('>a .sideMenuLabel', v).text() !== jQuery('.sideMenuLabel', obj).text())
                    self.collapse(jQuery(v).children('a').get(0), true);
            });

            // prevent fast toggling menu
            self.isBusy = true;

            // M4-36818: Can't navigate through the MC
            // make sure that this flag clear
            win.__clearTimeout(self.toggleSeed);
            self.toggleSeed = win.__setTimeout(function () {
                self.isBusy = false;
            }, 350);

            // expand or collapse
            if (isOpened) {
                self.collapse(obj, true, function () {
                    self.isBusy = false;
                });
            }
            else {
                self.expand(obj, true, function (sender) {
                    callback(sender);
                    self.isBusy = false;
                });
            }
        },
        expand: function (obj, animate, callback) {
            var self = this;
            if (animate) {
                jQuery(obj).next('ul').stop(true, true).slideDown(300, function () {
                    jQuery(this).attr('style', '');
                    self.expanded(obj, callback);
                });
            }
            else {
                self.expanded(obj, callback);
            }
        },
        expanded: function (obj, callback) {
            var self = this;
            jQuery(obj).parent('li').addClass(self.activeClass);
            if (typeof callback === 'function')
                callback(obj);
        },
        collapse: function (obj, animate, callback) {
            var self = this;
            if (animate) {
                jQuery(obj).next('ul').stop(true, true).slideUp(300, function () {
                    jQuery(this).attr('style', '');
                    self.collapsed(obj, callback);
                });
            }
            else {
                self.collapsed(obj, callback);
            }
        },
        collapsed: function (obj, callback) {
            var self = this;
            jQuery(obj).parent('li').removeClass(self.activeClass);
            if (typeof callback === 'function')
                callback(obj);
        }
    };


    win.MC.sideMenu = sideMenu;
    win.MC.sideMenu.init();

})(window);
