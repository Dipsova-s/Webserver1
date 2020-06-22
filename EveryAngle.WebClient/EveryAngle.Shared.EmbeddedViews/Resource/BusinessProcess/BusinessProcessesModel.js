var businessProcessBarHtmlTemplate = function () {
    return [
        '<!-- ko stopBinding: true -->',
        '<div class="businessProcesses" data-bind="',
            'foreach: { data: Data, afterRender: AfterRender }, ',
            'style: { visibility: Data().length > 0 ? \'visible\' : \'hidden\' }, ',
            'css: ContainerCssClass()">',
            '<!-- ko if: $index() === 0 -->',
                '<div class="businessProcessesItem businessProcessesItemHeader" data-bind="click: $root.HeaderClick"></div>',
            '<!-- /ko -->',
            '<!-- ko if: $root.Display() === $root.DISPLAY_MODE.CHECKBOX -->',
                '<div class="BusinessProcessCheckBox">',
                    '<label>',
                        '<input type="checkbox" data-bind="',
                            'click: function (data, event) { return $root.UpdateCheck(data) }, ',
                            'checked: $root.IsSelected($data), ',
                            'enable: $data.is_allowed, ',
                            'attr: { id: $data.id }">',
                        '<span class="label">',
                            '<span class="BusinessProcessBadge" data-bind="css: $root.BindCss($data, $index())"></span>',
                            '<span class="BusinessProcessBadgeLabel" data-bind="html: $root.BindName($data), css: $root.CssClassDisabled($data)"></span>',
                        '</span>',
                    '</label>',
                '</div>',
            '<!-- /ko -->',
            '<!-- ko if: $root.Display() === $root.DISPLAY_MODE.TAB -->',
                '<div class="businessProcessesItem" ',
                    'data-bind="css: $root.CssClass($data, $index()), click: $root.SetActive, attr: { title: $root.GetTitle($data) }">',
                    '<a data-bind="html: $root.BindName($data)"></a>',
                '</div>',
                '<!-- ko if: $root.Layout() === $root.LAYOUT.FLEXIBLE && $index() === $root.Data().length - 1 -->',
                '<div class="businessProcessesItem businessProcessesItemMore" ',
                    'data-bind="click: $root.MoreClick, css: { active: $root.HiddenSelectingCount }">',
                    '<span data-bind="text: $root.HiddenSelectingCount, visible: $root.HiddenSelectingCount"></span>',
                    '<a>&nbsp;</a>',
                '</div>',
                '<!-- /ko -->',
            '<!-- /ko -->',
        '</div>',
        '<!-- /ko -->'
    ].join('');
};

var businessProcessesModel = {};
businessProcessesModel.General = new BusinessProcessesViewModel();

function BusinessProcessesViewModel(externalData) {
    //BOF: View model properties
    var self = this;
    self.IsLoaded = ko.observable(false);
    self.DirectoryName = 'business_processes';
    self.FieldId = 'id';
    self.FieldLabel = 'name';
    self.Identity = 'bp';
    self.TotalBusinessProcesses = 9;
    self.MODE = {
        COMPACT: 1,
        FULL: 2
    };
    self.DISPLAY_MODE = {
        TAB: 0,
        CHECKBOX: 1
    };
    self.Display = ko.observable(self.DISPLAY_MODE.TAB);
    self.Mode = ko.observable(self.MODE.COMPACT);
    self.Theme = ko.observable('default');
    self.MultipleActive = ko.observable(false);
    self.CanEmpty = ko.observable(true);
    self.CurrentActive = ko.observable({});
    self.Data = ko.observable();
    self.ClickHeaderCallback = ko.observable(null);
    self.ClickCallback = ko.observable(null);
    self.ReadOnly = ko.observable(false);
    self.HiddenSelectingCount = ko.observable(0);
    self.LAYOUT = {
        FLEXIBLE: 1,
        NORMAL: 2
    };
    self.Layout = ko.observable(self.LAYOUT.FLEXIBLE);
    self.SmartTitle = ko.observable(false);
    //EOF: View model properties

    //BOF: View model methods
    self.InitialData = function (externalData) {
        if (externalData) {
            // external data
            self.SetData(externalData, false);
        }
        else if (self.HasDataInStorage(self.DirectoryName)) {
            // storage
            self.SetData(jQuery.localStorage(self.DirectoryName), false);
        }

        if (businessProcessesModel.General && !businessProcessesModel.General.IsLoaded()) {
            businessProcessesModel.General.SetData(self.Data());
        }
    };
    self.ApplyHandler = function (container) {
        container = jQuery(container);
        if (container.length) {
            container.html(businessProcessBarHtmlTemplate());

            var bindElement = container.find('.businessProcesses').get(0);
            var currentBinding = ko.dataFor(bindElement);
            if (!currentBinding || currentBinding.Identity !== self.Identity) {
                ko.applyBindings(self, bindElement);
            }
        }
    };
    self.Load = function () {
        if (businessProcessesModel.General.IsLoaded()) {
            self.SetData(businessProcessesModel.General.Data(), false);
            self.IsLoaded(true);
            return self.Data();
        }

        var directoryUri = directoryHandler.GetDirectoryUri(self.DirectoryName);
        var query = {};
        query['limit'] = 100;
        return GetDataFromWebService(directoryUri, query)
            .done(function (data) {
                self.SetData(data.business_processes);
            });
    };
    self.HasDataInStorage = function (name) {
        return jQuery.localStorage && jQuery.localStorage(name);
    };
    self.SetData = function (data, storage) {
        var bps = [];
        jQuery.each(ko.toJS(data), function (index, bp) {
            bps[index] = jQuery.extend({
                "id": bp.id,
                "enabled": true,
                "system": true,
                "uri": '',
                "name": bp.id,
                "abbreviation": bp.id,
                "order": 0,
                "is_allowed": false
            }, bp);
        });

        self.Data(bps);
        if (jQuery.localStorage && storage !== false)
            jQuery.localStorage(self.DirectoryName, bps);

        self.IsLoaded(true);
    };
    self.ContainerCssClass = function () {
        return [
            self.Theme(),
            self.Mode() === self.MODE.COMPACT ? 'businessProcessesCompact' : 'businessProcessesFull',
            self.Layout() === self.LAYOUT.NORMAL ? 'normal' : 'flexible',
            self.ReadOnly() ? 'readonly' : ''
        ].join(' ');
    };
    self.CssClass = function (data, index) {
        var classes = ['businessProcessesItem' + ((index % self.TotalBusinessProcesses) + 1), data.id.toUpperCase()];
        if (index === self.Data().length - 1)
            classes.push('last');
        if (self.CurrentActive()[data.id])
            classes.push('active');
        if (!data.is_allowed)
            classes.push('disabled');
        if (data.__readonly)
            classes.push('readonly');

        return classes.join(' ');
    };
    self.CssClassDisabled = function (data) {
        if (!data.is_allowed) {
            return 'disabled';
        }
        return '';
    };
    self.AfterRender = function (element, data) {
        // set active to false if is_allow = false
        if (!data.is_allowed && !data.__readonly)
            self.CurrentActive()[data.id] = false;

        self.UpdateLayoutAfterRender(element, data);
    };
    self.UpdateLayoutAfterRender = function (element, data) {
        var models = self.Data();
        var lastModel = models.length - 1;
        if (models[lastModel] && data.id === models[lastModel].id) {
            setTimeout(function () {
                self.UpdateLayout(jQuery(element).parent('.businessProcesses'));
            }, 1000);
        }
    };
    self.DoCallbackFunction = function (fn, args) {
        if (jQuery.isFunction(fn))
            fn.apply(self, args);
    };
    self.HeaderClick = function () {
        if (!self.CanClickHeader())
            return false;

        var oldActiveList = self.GetActive();

        var currentActiveList = {};
        jQuery.each(self.Data(), function (k, v) {
            if (v.is_allowed)
                currentActiveList[v.id] = true;
        });
        self.CurrentActive(currentActiveList);

        self.DoCallbackFunction(self.ClickHeaderCallback(), [oldActiveList, self.GetActive()]);
    };
    self.CanClickHeader = function () {
        return !self.ReadOnly() && self.MultipleActive();
    };
    self.MoreClick = function (data, event) {
        var container = jQuery(event.currentTarget).parent('.businessProcesses');
        var what = container.hasClass('expand') ? 'collapse' : 'expand';
        self.ToggleMore(container, what);
    };
    self.ToggleMore = function (container, what) {
        if (what === 'expand') {
            container.addClass('expand');

            self.SetHideMoreEvent();
        }
        else {
            container.removeClass('expand');
        }
    };
    self.SetHideMoreEvent = function () {
        jQuery(window).one('click.bp touchstart.bp', self.HideMoreEventClick);
    };
    self.HideMoreEventClick = function (e) {
        if (!jQuery(e.target).parents('.businessProcesses').length) {
            jQuery('.businessProcesses').removeClass('expand');
        }
        else {
            self.SetHideMoreEvent();
        }
    };
    self.IsSelected = function (data) {
        var active = self.CurrentActive();
        return active[data.id] || false;
    };
    self.UpdateCheck = function (data) {

        if (self.ReadOnly() || data.__readonly) {
            return false;
        }

        var active = self.CurrentActive();
        var isActived = active[data.id] || false;
        var changed = false;

        if (self.CanSetActive(data.is_allowed, isActived)) {
            if (self.MultipleActive()) {
                active[data.id] = !isActived;
                changed = true;
            }
            else {
                changed = !isActived;
                jQuery.each(active, function (id) {
                    active[id] = false;
                });
                active[data.id] = true;
            }
            self.CurrentActive(active);

            self.DoCallbackFunction(self.ClickCallback(), [data, event, changed]);
                return true;
            }
        return false;
    };
    self.SetCheckBoxStyle = function () {
        self.Display(self.DISPLAY_MODE.CHECKBOX);
        self.Theme('businessProcessesCheckBoxList');
    };
    self.SetActive = function (data, event) {

        if (self.ReadOnly() || data.__readonly) {
            return false;
        }

        var element = jQuery(event.currentTarget);
        var container = element.parent('.businessProcesses');
        var active = self.CurrentActive();
        var isActived = element.hasClass('active');
        var changed = false;

        if (self.CanSetActive(data.is_allowed, isActived)) {
            if (self.MultipleActive()) {
                active[data.id] = !isActived;
                changed = true;
                element.toggleClass('active');
            }
            else {
                changed = !isActived;
                jQuery.each(active, function (id) {
                    active[id] = false;
                });
                active[data.id] = true;

                container.children('.businessProcessesItem:not(.businessProcessesItemMore)').removeClass('active');
                element.addClass('active');
            }
            self.CurrentActive(active);
        }

        self.HiddenSelectingCount(container.children('.more.active').length);

        // hide bp dropdown if is a single selection
        if (changed && !self.MultipleActive())
            jQuery(window).trigger('click.bp');

        self.DoCallbackFunction(self.ClickCallback(), [data, event, changed]);
    };
    self.CanSetActive = function (isAllowed, isActived) {
        var canSetActive = self.CanEmpty() || self.GetActive().length !== 1 || !isActived;
        return isAllowed && canSetActive;
    };
    self.GetActive = function () {
        var list = [];
        var currentActive = self.CurrentActive();
        jQuery.each(self.Data(), function (index, bp) {
            if (currentActive[bp.id])
                list.push(bp.id);
        });
        return list;
    };
    self.GetTitle = function (data) {
        var title = '';
        var activeList = self.GetActive();
        var currentActive = self.CurrentActive();
        var hasOneActive = !self.CanEmpty() && activeList.length === 1 && currentActive[data.id];
        if (self.SmartTitle()) {
            if (!hasOneActive && currentActive[data.id]) {
                title = Captions.Tooltip_BusinessProcess_Deselect + ' ';
            }
            else if (!hasOneActive) {
                title = Captions.Tooltip_BusinessProcess_Select + ' ';
            }
        }

        title += data.name;

        return title;
    };
    self.BindName = function (data) {
        var text = self.Mode() === self.MODE.COMPACT ? data.abbreviation : data.name;

        var words = text.split(' ');
        var wordsLength = words.length;

        if (wordsLength === 1) {
            return text;
        }
        else if (wordsLength === 2) {
            return words.join('<br />');
        }
        else {
            return self.GetSmartName(words, wordsLength);
        }
    };
    self.BindCss = function (data, index) {
        return 'BusinessProcessBadgeItem' + (index % self.TotalBusinessProcesses) + ' ' + data.id;
    };
    self.GetSmartName = function (words, wordsLength) {
        var eaTextMeasure = self.GetTextMeasureElement();
        var distance = [];
        var name;

        for (var i = 0; i < wordsLength - 1; i++) {
            var text1 = words.slice(0, i + 1).join(' ');
            var text2 = words.slice(i + 1).join(' ');

            distance[i] = Math.abs(eaTextMeasure.text(text2).width() - eaTextMeasure.text(text1).width());
            if (i === 0 || distance[i] < distance[i - 1])
                name = text1 + '<br />' + text2;
        }
        eaTextMeasure.text('');

        return name;
    };
    self.GetTextMeasureElement = function () {
        var element = jQuery('#eaTextMeasure');
        if (!element.length)
            element = jQuery('<div id="eaTextMeasure" />').css({ visibility: 'hidden', position: 'absolute', 'white-space': 'nowrap', left: 0, top: 0 }).appendTo('body');
        return element;
    };
    self.UpdateLayout = function (container) {
        // reset things
        container.removeClass('expandable').css('width', '');
        container.children('.businessProcessesItem').removeClass('more linebreak').removeAttr('style');

        // normal layout should be handled by css
        if (self.Layout() === self.LAYOUT.NORMAL || self.Display() === self.DISPLAY_MODE.CHECKBOX)
            return;

        // flexible layout must be handled by js
        var bpItems = container.children('.businessProcessesItem:not(.businessProcessesItemHeader,.businessProcessesItemMore)');
        var moreButtonSize = self.GetMoreButtonSize(container);
        var maxSize = self.GetMaxContainerSize(container, moreButtonSize);
        var bpSize = 0;
        var currentSize = 0;
        var itemHeight = container.height();
        var itemPosition = { top: 0 };
        var itemWidth = self.GetMaxItemSize(bpItems);
        var expandable = false;
        var hiddenCount = 0;

        bpItems.each(function (index, element) {
            element = jQuery(element);
            currentSize += itemWidth;
            if (currentSize > maxSize + (element.hasClass('last') ? moreButtonSize : 0)) {
                itemPosition.top += itemHeight;
                element.css(itemPosition).addClass('more');
                expandable = true;
                if (element.hasClass('active')) {
                    hiddenCount++;
                }
            }
            else {
                bpSize = currentSize;
            }

            self.SetItemLineBreak(element);
        });

        self.HiddenSelectingCount(hiddenCount);

        // container class
        if (expandable) {
            container.width(bpSize).addClass('expandable');
        }
    };
    self.GetMoreButtonSize = function (container) {
        return container.children('.businessProcessesItemMore').width();
    };
    self.GetMaxContainerSize = function (container, moreButtonSize) {
        var width = container.width();
        return (width ? width : parseFloat(container.css('max-width'))) - moreButtonSize;
    };
    self.GetMaxItemSize = function (bpItems) {
        return bpItems.map(function () { return jQuery(this).width(); }).get().max();
    };
    self.SetItemLineBreak = function (element) {
        if (/<br ?\/?>/ig.test(element.children().html())) {
            element.addClass('linebreak');
        }
    };
    //EOF: View model methods

    // constructure
    self.InitialData(externalData);
}
