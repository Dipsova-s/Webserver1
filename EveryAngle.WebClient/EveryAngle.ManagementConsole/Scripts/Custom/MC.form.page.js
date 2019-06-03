(function (win) {

    var page = {
        _states: [],
        _states_custom: [],
        STATE: {
            CLIENT: 'client',
            SERVER: 'server'
        },
        _data_initial: null,
        _function_getdata: function () { return null; },
        init: function (getDataFunction) {
            if (typeof getDataFunction === 'function') {
                this._function_getdata = getDataFunction;
                this._data_initial = this._function_getdata();
            }
            else {
                this.clear();
            }
        },
        resetInitialData: function () {
            this._data_initial = this._function_getdata();
        },
        checkChange: function (callback) {
            if (JSON.stringify(this._data_initial) !== JSON.stringify(this._function_getdata())) {
                MC.util.showPopupConfirmation(Localization.MC_CheckChangePage.replace('\\n', '\n'), callback);
            }
            else {
                callback();
                return true;
            }
        },
        clear: function () {
            this._function_getdata = function () { return null; };
            this._data_initial = null;
            this._states = [];
        },
        collectStates: function () {
            var self = this;
            self._states = [];

            jQuery('[data-role="grid"]').each(function (index, element) {
                var grid = jQuery(element).data('kendoGrid');
                if (grid) {
                    var gridFilter = grid.wrapper.parents('.gridContainer:first').prevAll('.gridToolbar').find('input[data-role="gridfilter"]');
                    self._states.push({
                        type: gridFilter.filter('[data-method="remote"]').length ? self.STATE.SERVER : self.STATE.CLIENT,
                        target: 'grid',
                        options: {
                            selector: '#' + element.id,
                            query: {
                                page: grid.dataSource.page() || 1,
                                sort: grid.dataSource.sort() || [],
                                q: encodeURIComponent(gridFilter.val() || '')
                            }
                        },
                        execute: function (state) {
                            return self.executeState(state);
                        }
                    });
                }
            });

            self.addCustomStateToState(self._states_custom);
        },
        setCustomState: function (type, fnOptions, fnExecute) {
            this._states_custom.push({
                __is_custom: true,
                type: type,
                setOptions: fnOptions,
                execute: fnExecute
            });
        },
        addCustomStateToState: function (customState) {
            var self = this;
            jQuery.each(customState, function (index, state) {
                state.options = state.setOptions();
                var existState = self.getStateBySelector(state.options.selector);
                if (existState)
                    jQuery.extend(true, existState, state);
                else
                    self._states.push(state);
            });
        },
        executeState: function (state) {
            var self = this;
            if (state.target === 'grid')
                self.executeGridState(state);
        },
        executeGridState: function (state) {
            var grid = jQuery(state.options.selector).data('kendoGrid');

            if (!grid || grid.wrapper.parents('.popup').length)
                return;

            var input = grid.wrapper.parents('.gridContainer:first').prevAll('.gridToolbar')
                            .find('input[data-role="gridfilter"]');

            if (state.options.query.q) {
                input.data('defaultValue', decodeURIComponent(state.options.query.q))
                    .val(decodeURIComponent(state.options.query.q));

                if (grid.dataSource.transport.options && grid.dataSource.transport.options.read) {
                    grid.dataSource.transport.options.read.data = function () {
                        return {
                            q: function () {
                                return encodeURIComponent(input.val());
                            }
                        };
                    };
                }
            }

            var queryable = grid.options.pageable || grid.options.sortable;
            var isVirtualScroll = typeof grid.options.scrollable === 'object' && grid.options.scrollable.virtual;
            if (queryable || isVirtualScroll) {
                if (isVirtualScroll) {
                    state.options.query.page = 1;
                }
                state.options.query.pageSize = grid.dataSource.pageSize();
                grid.dataSource.query(state.options.query);
            }
            else if (state.options.query.q) {
                input.trigger('keyup');
            }
        },
        executeStates: function () {
            var self = this;
            jQuery.each(self._states, function (index, state) {
                state.execute(state);
            });
        },
        clearStates: function () {
            this._states = [];
            this._states_custom = [];
        },
        getStateBySelector: function (selector) {
            var existState = null;
            jQuery.each(this._states, function (index, state) {
                if (state.options.selector === selector) {
                    existState = state;
                    return false;
                }
            });
            return existState;
        }
    };

    win.MC.form.page = page;

})(window);
