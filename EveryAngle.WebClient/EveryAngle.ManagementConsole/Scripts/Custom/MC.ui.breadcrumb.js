(function (win) {

var breadcrumb = {
    target: '#breadcrumbList',
    current:null,
    data: [],
    render: function (obj) {
        var self = this;
        self.data = [];
        jQuery(this.target).empty();
        jQuery(obj).parents('li.active').each(function (k, v) {
            var label = jQuery('>a .sideMenuLabel', v).text(),
                data =  {
                    sidemenu: jQuery('>a', v),
                    label: label
                };
            if (label != 'Overview')
                self.add(data);
        });

        var overviewObj = jQuery('#sideMenu-Overview > a');
        if (overviewObj.length) {
            self.add({
                sidemenu: overviewObj,
                label: overviewObj.text()
            });
        }

        // prevent click the last item
      
        if (jQuery.address.parameter('parameters')) {
            jQuery(this.target).find('a:last').addClass('noLink');
        }
    },
    add: function (data, addType) {
     
        if (typeof data == 'undefined') return;
        if (typeof (addType) == 'undefined') addType = 'first';

        if (addType == 'last') this.data.push(data);
        else this.data.splice(0, 0, data);

        var hasLink = (typeof data.sidemenu != 'undefined' && jQuery(data.sidemenu).data('url')) || typeof data.url != 'undefined';
        var link = jQuery('<a />')
                        .attr('href', typeof data.url != 'undefined' ? data.url : (jQuery(data.sidemenu).attr('href') || '#'))
                        .html(data.label)
                        .data('source', data)
                        .addClass(hasLink ? '' : 'noLink')
                        .click(function (data) {
                            if (jQuery(this).hasClass('noLink')) return false;

                            //if (!MC.form.page.checkChange()) return false;
                            MC.ui.breadcrumb.current = jQuery(this).data('source');
                            var onClick = function (data) {
                                MC.form.page.clear();
                                MC.form.page.clearStates();
                                
                                // remove breadcrumbs except index=0
                                var sourceData = MC.ui.breadcrumb.current; //jQuery(this).data('source');
                                for (var i = MC.ui.breadcrumb.data.length - 1; i > 0; i--) {
                                    if (MC.ui.breadcrumb.data[i].label == sourceData.label) break;
                                    MC.ui.breadcrumb.remove(i);
                                }

                                // default click action
                                if (typeof sourceData.sidemenu != 'undefined' && jQuery(sourceData.sidemenu).data('url')) {
                                    if (jQuery(sourceData.sidemenu).next('ul').length != 0) jQuery(sourceData.sidemenu).next('ul').hide();


                                    if (jQuery(sourceData.sidemenu).parent() != null && jQuery(sourceData.sidemenu).parent().hasClass('active')) {
                                        jQuery(sourceData.sidemenu).parent().removeClass('active');
                                    }

                                    jQuery(sourceData.sidemenu).trigger('click');
                                }
                                else if (typeof sourceData.url != 'undefined') {
                                    MC.ajax.request(sourceData);
                                }
                                MC.ui.breadcrumb.current = null;
                            };
                            MC.form.page.checkChange(onClick);
                            
                            return false;
                        });

        if (addType == 'last') jQuery(this.target).append(jQuery('<li />').html(link));
        else jQuery(this.target).prepend(jQuery('<li />').html(link));
    },
    remove: function (index) {
        this.data.splice(index, 1);
        jQuery('li', this.target).eq(index).remove();
    }
};
win.MC.ui.breadcrumb = breadcrumb;

})(window);
