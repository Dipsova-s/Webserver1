(function (win) {

    var checkForm = function () {
        //overriden in a specific page
        this.prepareForm();
        for (var i = 0, elements = (this.currentElements = this.elements()) ; elements[i]; i++) {
            if (this.findByName(elements[i].name).length != undefined && this.findByName(elements[i].name).length > 1) {
                for (var cnt = 0; cnt < this.findByName(elements[i].name).length; cnt++) {
                    this.check(this.findByName(elements[i].name)[cnt]);
                }
            }
            else {
                this.check(elements[i]);
            }
        }
        return this.valid();
    };

    var validatorFocusOut = function (element, event) {
        if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
            this.element(element);
        }
        jQuery('.error', this.settings.errorLabelContainer).hide();
    };
    var validatorFocusIn = function (element, event) {
        this.lastActive = element;

        // hide error label and remove error class on focus if enabled
        if (this.settings.focusCleanup && !this.blockFocusCleanup) {
            if (this.settings.unhighlight) {
                this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
            }
            this.addWrapper(this.errorsFor(element)).hide();
        }

        var container = this.settings.errorLabelContainer;
        jQuery('.error', container).hide();
        if (jQuery(element).hasClass('error')) jQuery(element).valid();
    };
    var validatorShowErrors = function (errorMap, errorList) {
        this.defaultShowErrors();

        var container = this.settings.errorLabelContainer;
        jQuery(container).empty();
        jQuery.each(errorList, function (idx, error) {
            var e = jQuery(error.element).parent('.btn').length != 0 ? jQuery(error.element).parent('.btn') : error.element,
                p = jQuery(e).offset(),
                h = jQuery(e).outerHeight(true);
            jQuery('<span class="error" />').css({
                left: p.left,
                top: p.top + h + 2
            })
            .data('element', error.element)
            .html(error.message)
            .appendTo(container);
        });

        if (errorList.length > 1) {
            jQuery('.error:gt(0)', container).hide();
        }
    };

    var validatorDefaultOptions = {
        onfocusout: validatorFocusOut,
        onfocusin: validatorFocusIn,
        errorLabelContainer: '#errorContainer',
        errorPlacement: jQuery.noop,
        showErrors: validatorShowErrors
    };

    var validator = {
        init: function () {
            MC.addPageReadyFunction(this.autoValidator);
            MC.addAjaxDoneFunction(this.autoValidator);
        },
        autoValidator: function (obj) {
            if (typeof (jQuery('html').data('validator-initialized')) == 'undefined') {
                // override checkForm
                jQuery.validator.prototype.checkForm = checkForm;

                // set default validator options
                jQuery.validator.setDefaults(validatorDefaultOptions);

                // set initialize flag
                jQuery('html').data('validator-initialized', true);

                // create error container
                jQuery('body').append('<div id="errorContainer" class="errorContainer" />');

                // hide validator messsage on scrolling
                jQuery('html,body').on('mousewheel', MC.form.validator.hideErrorMessage);
            }

            jQuery('#errorContainer').empty();
            var ui = jQuery(obj || 'form[data-role="validator"]');

            ui.each(function () {
                var element = jQuery(this);
                if (element.data('auto-validator'))
                    return;

                var settings = element.data();
                element.data('auto-validator', true);
                element.validate(settings);
            });
        },
        hideErrorMessage: function () {
            jQuery('#errorContainer > .error').hide();
        }
    };

    win.MC.form.validator = validator;
    win.MC.form.validator.init();

})(window);
