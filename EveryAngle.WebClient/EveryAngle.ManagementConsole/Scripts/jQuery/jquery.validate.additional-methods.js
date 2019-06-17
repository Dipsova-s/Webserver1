/*!
 * jQuery Validation Plugin 1.11.1
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright 2013 Jörn Zaefferer
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

jQuery.validator.addMethod("letterswithbasicpunc", function(value, element) {
	return this.optional(element) || /^[a-z\-.,()'"\s]+$/i.test(value);
}, Localization.MC_Validation_LettersWithBasicPunc);

jQuery.validator.addMethod("alphanumeric", function(value, element) {
	return this.optional(element) || /^\w+$/i.test(value);
}, Localization.MC_Validation_AlphaNumeric);

jQuery.validator.addMethod("lettersonly", function(value, element) {
	return this.optional(element) || /^[a-z]+$/i.test(value);
}, Localization.MC_Validation_LettersOnly);

jQuery.validator.addMethod("nowhitespace", function(value, element) {
	return this.optional(element) || /^\S+$/i.test(value);
}, Localization.MC_Validation_NoWhiteSpace);

jQuery.validator.addMethod("integer", function(value, element) {
	return this.optional(element) || /^-?\d+$/.test(value);
}, Localization.MC_Validation_Integer);


/**
 * Return true, if the value is a valid date, also making this formal check dd/mm/yyyy.
 *
 * @example jQuery.validator.methods.date("01/01/1900")
 * @result true
 *
 * @example jQuery.validator.methods.date("01/13/1990")
 * @result false
 *
 * @example jQuery.validator.methods.date("01.01.1900")
 * @result false
 *
 * @example <input name="pippo" class="{dateITA:true}" />
 * @desc Declares an optional input element whose value must be a valid date.
 *
 * @name jQuery.validator.methods.dateITA
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
jQuery.validator.addMethod("dateITA", function(value, element) {
	var check = false;
	var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
	if( re.test(value)) {
		var adata = value.split('/');
		var gg = parseInt(adata[0],10);
		var mm = parseInt(adata[1],10);
		var aaaa = parseInt(adata[2],10);
		var xdata = new Date(aaaa,mm-1,gg);
		if ( ( xdata.getFullYear() === aaaa ) && ( xdata.getMonth() === mm - 1 ) && ( xdata.getDate() === gg ) ){
			check = true;
		} else {
			check = false;
		}
	} else {
		check = false;
	}
	return this.optional(element) || check;
}, Localization.MC_Validation_DateITA);

jQuery.validator.addMethod("dateNL", function(value, element) {
	return this.optional(element) || /^(0?[1-9]|[12]\d|3[01])[\.\/\-](0?[1-9]|1[012])[\.\/\-]([12]\d)?(\d\d)$/.test(value);
}, Localization.MC_Validation_DateNL);

jQuery.validator.addMethod("time", function(value, element) {
	return this.optional(element) || /^([01]\d|2[0-3])(:[0-5]\d){1,2}$/.test(value);
}, Localization.MC_Validation_Time);
jQuery.validator.addMethod("time12h", function(value, element) {
	return this.optional(element) || /^((0?[1-9]|1[012])(:[0-5]\d){1,2}(\ ?[AP]M))$/i.test(value);
}, Localization.MC_Validation_Time12h);

/**
* Return true if the field value matches the given format RegExp
*
* @example jQuery.validator.methods.pattern("AR1004",element,/^AR\d{4}$/)
* @result true
*
* @example jQuery.validator.methods.pattern("BR1004",element,/^AR\d{4}$/)
* @result false
*
* @name jQuery.validator.methods.pattern
* @type Boolean
* @cat Plugins/Validate/Methods
*/
jQuery.validator.addMethod("pattern", function(value, element, param) {
	if (this.optional(element)) {
		return true;
	}
	if (typeof param === 'string') {
		param = new RegExp('^(?:' + param + ')$');
	}
	return param.test(value);
}, Localization.MC_Validation_Pattern);

/*
 * Lets you say "at least X inputs that match selector Y must be filled."
 *
 * The end result is that neither of these inputs:
 *
 *  <input class="productinfo" name="partnumber">
 *  <input class="productinfo" name="description">
 *
 *  ...will validate unless at least one of them is filled.
 *
 * partnumber:  {require_from_group: [1,".productinfo"]},
 * description: {require_from_group: [1,".productinfo"]}
 *
 */
jQuery.validator.addMethod("require_from_group", function(value, element, options) {
	var validator = this;
	var selector = options[1];
	var validOrNot = $(selector, element.form).filter(function() {
		return validator.elementValue(this);
	}).length >= options[0];

	if(!$(element).data('being_validated')) {
		var fields = $(selector, element.form);
		fields.data('being_validated', true);
		fields.valid();
		fields.data('being_validated', false);
	}
	return validOrNot;
}, jQuery.format(Localization.MC_Validation_RequireFromGroup));

/*
 * Lets you say "either at least X inputs that match selector Y must be filled,
 * OR they must all be skipped (left blank)."
 *
 * The end result, is that none of these inputs:
 *
 *  <input class="productinfo" name="partnumber">
 *  <input class="productinfo" name="description">
 *  <input class="productinfo" name="color">
 *
 *  ...will validate unless either at least two of them are filled,
 *  OR none of them are.
 *
 * partnumber:  {skip_or_fill_minimum: [2,".productinfo"]},
 *  description: {skip_or_fill_minimum: [2,".productinfo"]},
 * color:       {skip_or_fill_minimum: [2,".productinfo"]}
 *
 */
jQuery.validator.addMethod("skip_or_fill_minimum", function(value, element, options) {
	var validator = this,
		numberRequired = options[0],
		selector = options[1];
	var numberFilled = $(selector, element.form).filter(function() {
		return validator.elementValue(this);
	}).length;
	var valid = numberFilled >= numberRequired || numberFilled === 0;

	if(!$(element).data('being_validated')) {
		var fields = $(selector, element.form);
		fields.data('being_validated', true);
		fields.valid();
		fields.data('being_validated', false);
	}
	return valid;
}, jQuery.format(Localization.MC_Validation_SkipOrFillMinimum));

// Accept a value from a file input based on a required mimetype
jQuery.validator.addMethod("accept", function(value, element, param) {
	// Split mime on commas in case we have multiple types we can accept
	var typeParam = typeof param === "string" ? param.replace(/\s/g, '').replace(/,/g, '|') : "image/*",
	optionalValue = this.optional(element),
	i, file;

	// Element is optional
	if (optionalValue) {
		return optionalValue;
	}

	if ($(element).attr("type") === "file") {
		// If we are using a wildcard, make it regex friendly
		typeParam = typeParam.replace(/\*/g, ".*");

		// Check if the element has a FileList before checking each file
		if (element.files && element.files.length) {
			for (i = 0; i < element.files.length; i++) {
				file = element.files[i];

				// Grab the mimetype from the loaded file, verify it matches
				if (!file.type.match(new RegExp( ".?(" + typeParam + ")$", "i"))) {
					return false;
				}
			}
		}
	}

	// Either return true because we've validated each file, or because the
	// browser does not support element.files and the FileList feature
	return true;
}, jQuery.format(Localization.MC_Validation_Accept));

// Older "accept" file extension method. Old docs: http://docs.jquery.com/Plugins/Validation/Methods/accept
jQuery.validator.addMethod("extension", function(value, element, param) {
	param = typeof param === "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
	return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
}, jQuery.format(Localization.MC_Validation_Extension));

jQuery.validator.addMethod("field_id", function (value, element) {
    return this.optional(element) || /^[a-z_](\w*)$/i.test(value);
}, Localization.MC_Validation_FieldId);

var restrictedIds = ['bp'];
jQuery.validator.addMethod("restricted_ids", function (value, element) {
    return this.optional(element) || jQuery.inArray(value.toLowerCase(), restrictedIds) === -1;
}, Localization.MC_Validation_ID_Restricted.replace('{0}', restrictedIds.join(', ')));

jQuery.validator.addMethod("date-localized", function (value, element) {
    var obj = jQuery(element).data('kendoDatePicker');
    return this.optional(element) || (typeof obj !== 'undeined' && obj.value() !== null);
}, Localization.MC_Validation_DateLocalized);

jQuery.validator.addMethod("packagename", function (value, element) {
    var filename = value.replace(/\\/g, '/');
    filename = filename.substr(filename.lastIndexOf('/') + 1);
    return this.optional(element) || /^[\w]+\-[\w\.]+\-\d+\w*(\.\d+\w*)*\.eapackage$/i.test(filename);
}, Localization.MC_Validation_Packagename);

jQuery.validator.addMethod("agent_url", function (value, element) {
    return this.optional(element) || /https?:\/\/([a-z0-9][a-z0-9\.\-_]*[a-z0-9]+)(:[0-9]+)?(.*)$/ig.test(value);
}, Localization.MC_Validation_AgentUrl);

jQuery.validator.addMethod("email", function (value) {
    if (value === '')
        return true;

    return checkEmailAddress(value);

}, Localization.MC_Validation_Email);

jQuery.validator.addMethod("phoneNumber", function (value) {
    if (value === '')
        return true;
 
    if (!/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i.test(value))
        return false;

    return true;
}, Localization.MC_Validation_PhoneNumber);

jQuery.validator.addMethod("required_default_roles", function (value, element) {
    var isAutoCreate = jQuery('[name="auto_create_users"]').prop('checked');
    var isSyncRolesToGroups = jQuery('#sync_roles_to_groups').prop('checked');
    return !isAutoCreate || (value && value.length) || isSyncRolesToGroups;
}, Localization.MC_Validation_RequiredDefaultRoles);

jQuery.validator.addMethod("valid_default_pagesize", function (value, element) {
    var defaultPageElement = $('#default_pagesize');
    var defaultPageValue = defaultPageElement.val();
    var maxPageSizeElement = $('#max_pagesize');
    var maxPageSizeValue = maxPageSizeElement.val();
    var isValid = true;
    if (defaultPageValue && maxPageSizeValue && parseInt(defaultPageValue, 10) > parseInt(maxPageSizeValue, 10)) {
        isValid = false;
        defaultPageElement.addClass('error');
        maxPageSizeElement.addClass('error');
    }
    return value === '' || isValid;
}, Localization.MC_Validation_ValidDefaultPageSize);

jQuery.validator.addMethod("valid_action_email", function (value, element) {
    var recipients = jQuery('#email_recipients').removeClass('error').val();
    var subject = jQuery('#email_subject').removeClass('error').val();
    var body = jQuery('#email_body').removeClass('error').val();

    jQuery('#email_recipients_tagsinput').removeClass('error');
    if (recipients + subject + body) {
        if (!recipients) jQuery('#email_recipients_tagsinput').addClass('error');
        if (!subject) jQuery('#email_subject').addClass('error');
        if (!body) jQuery('#email_body').addClass('error');

        return jQuery(element).val() !== '';
    }

    return true;
}, Localization.MC_Validation_ValidActionEmail);

jQuery.validator.addMethod("is_ansi", function (value, element) {
    return this.optional(element) || !/[^\u0000-\u007F]+/g.test(value);
}, Localization.MC_Validation_IsAnsi);

jQuery.validator.addMethod("angle_display", function (value, element) {
    return this.optional(element) || /(\/?models\/\d+\/angles\/\d+)(\/displays\/\d+)?/ig.test(value);
}, Localization.MC_Validation_AngleDisplay);

jQuery.validator.addMethod("timeminute", function (value, element) {
    return this.optional(element) || /^((00)(:[0-5]\d){1,2})|(01:00)$/.test(value);
}, Localization.MC_Validation_TimeMinute);

jQuery.validator.addMethod("continue_with_days", function (value, element) {
    var row = jQuery(element).parents('form:first');
    var isContinue = row.find('[name^="IsContinuous"]').prop('checked');
    return !isContinue || (isContinue && row.find('[name^="Days"]:checked').length);
}, jQuery.validator.messages.required);

jQuery.validator.addMethod("required_comment_when_attachedfile", function (value, element) {
    if (jQuery('#CommentForm .k-upload-status').text() === "") return true;
    if (jQuery('#CommentForm .k-upload-status').text() !== "" && $('#CommentText').val() !== "") return true;
}, jQuery.validator.messages.required);

jQuery.validator.addMethod("parameterized_between", function (value, element) {
    var container = jQuery(element).parents('td:first');
    var arg1 = container.find('[name^="argument1"]');
    var arg2 = container.find('[name^="argument2"]');

    if (!arg1.val() && !arg2.val()) {
        return true;
    }
    else if (!arg1.val()) {
        if (!arg1.is(element)) {
            arg1.valid();
            return true;
        }
        else {
            arg1.prev().addClass('error');
            return false;
        }
    }
    else if (!arg2.val()) {
        if (!arg2.is(element)) {
            arg2.valid();
            return true;
        }
        else {
            arg2.prev().addClass('error');
            return false;
        }
    }
    else {
        return true;
    }
}, jQuery.validator.messages.required);

jQuery.validator.addMethod("existing_username", function (value, element) {
    var isExistUserName;
    if (value) {
        isExistUserName = false;
        var ui = $(element).data('kendoAutoComplete');
        var data = [];
        if (ui) {
            data = ui.dataItems();
        }
        value = value.toLowerCase();
        $.each(data, function (i, d) {
            if (d.Id.toLowerCase() === value) {
                isExistUserName = true;
                return false;
            }
        });
    }
    else {
        isExistUserName = true;
    }
    return this.optional(element) || isExistUserName;
}, Localization.MC_Validation_UserNotExist);

jQuery.validator.addMethod("google_analytics_id", function (value, element) {
    return this.optional(element) || /^ua-\d{4,9}-\d{1,4}$/i.test(value);
}, Localization.MC_Validation_GoogleAnalyticsId);

jQuery.validator.addMethod("table_name", function (value, element) {
    return this.optional(element) || /^[a-z\{][\w\{\}\:]+$/gi.test(value);
}, Localization.MC_Validation_TableName);

jQuery.validator.addMethod("package_name", function (value, element) {
    return this.optional(element) || /^[\w]+$/g.test(value);
}, Localization.CreateEAPackageInvalidPackageName);

jQuery.validator.addMethod("package_id", function (value, element) {
    return this.optional(element) || /^[a-z_](\w*)$/ig.test(value);
}, Localization.Info_InvalidPackageId);

jQuery.validator.addMethod("package_version", function (value, element) {
    // 1. not start with dot
    // 2. not end with dot
    // 3. only 1 dot
    var isValidDot = value[0] !== '.' && value[value.length - 1] !== '.' && !/[\.]{2,}/g.test(value);

    // 1. contains number and dot
    var isValidVersion = isValidDot && /^([\d\.])+$/ig.test(value);

    return this.optional(element) || isValidVersion;
}, Localization.Info_InvalidPackageVersion);
