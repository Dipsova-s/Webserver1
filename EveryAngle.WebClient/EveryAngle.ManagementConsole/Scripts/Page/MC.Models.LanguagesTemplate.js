;(function (win, models) {

    function LanguagesTemplate() {
        var self = this;

        self.GetColumnActionHtml = function (data) {
            var html = '';
            if (data.Id === 'en') {
                html += '<label><input value="True" name="' + data.Id + '" type="radio" checked="checked" disabled="disabled" /><span class="label">Enable</span></label>';
            }
            else if (MC.Models.Languages.IsContainLanguage(data.Id)) {
                html += '<label><input value="True" name="' + data.Id + '" type="radio" checked="checked" /><span class="label">Enable</span></label>';
                html += '<label><input value="False" name="' + data.Id + '" type="radio" /><span class="label">Disable</span></label>';
            }
            else {
                html += '<label><input value="True" name="' + data.Id + '" type="radio" /><span class="label">Enable</span></label>';
                html += '<label><input value="False" name="' + data.Id + '" type="radio" checked="checked"/><span class="label">Disable</span></label>';
            }
            return html;
        };
    }

    win.MC.Models = models || {};
    jQuery.extend(win.MC.Models, {
        LanguagesTemplate: new LanguagesTemplate()
    });

})(window, MC.Models);
