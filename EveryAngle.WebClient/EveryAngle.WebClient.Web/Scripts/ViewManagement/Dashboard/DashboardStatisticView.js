function DashboardStatisticView() {
    var self = this;
    self.GetTemplate = function () {
        return [
            '<div class="form-row row-statistic">',
                '<div class="form-col form-col-body">',
                    '<div class="form-col-title">',
                        '<span class="statistic-title" data-bind="text: Localization.Statistics"></span>',
                    '</div>',
                    '<div class="row-created">',
                        '<span class="field" data-bind="text: Localization.CreatedBy"></span>:',
                        '<span class="label-data label-data-user" data-bind="text: StatisticInfo().CreatedBy.full_name">-</span>',
                        '<span class="label-data label-data-date" data-bind="text: StatisticInfo().CreatedBy.datetime">-</span>',
                    '</div>',
                    '<div class="row-last-changed">',
                        '<span class="field" data-bind="text: Localization.LastChangedBy"></span>:',
                        '<span class="label-data label-data-user" data-bind="text: StatisticInfo().ChangedBy.full_name">-</span>',
                        '<span class="label-data label-data-date" data-bind="text: StatisticInfo().ChangedBy.datetime">-</span>',
                    '</div>',
                    '<div class="row-last-executed">',
                        '<span class="field" data-bind="text: Localization.LastExecutedBy"></span>:',
                        '<span class="label-data label-data-user" data-bind="text: StatisticInfo().ExecutedBy.full_name">-</span>',
                        '<span class="label-data label-data-date" data-bind="text: StatisticInfo().ExecutedBy.datetime">-</span>',
                    '</div>',
                '</div>',
            '</div> '
        ].join('');
    };
}