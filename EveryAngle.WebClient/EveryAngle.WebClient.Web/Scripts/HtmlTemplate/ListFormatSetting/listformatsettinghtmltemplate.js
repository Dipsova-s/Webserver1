var numberListFormatHtmlPartialTemplate = function (dataType) {

    var numberListFormatHtmlPartialTemplate = "<div class=\"FieldFormatList\">";
    numberListFormatHtmlPartialTemplate += "    <div class=\"row\">";
    numberListFormatHtmlPartialTemplate += "        <div class=\"field\"><span>" + Localization.FormatSettingDisplayUnits + "<\/span><\/div>";
    numberListFormatHtmlPartialTemplate += "        <div class=\"input\"><input id=\"FormatDisplayUnitSelect\" class=\"eaDropdown eaDropdownSize40\" \/><\/div>";
    numberListFormatHtmlPartialTemplate += "    <\/div>";
    if (dataType !== enumHandlers.FIELDTYPE.INTEGER) {
        numberListFormatHtmlPartialTemplate += "    <div class=\"row\">";
        numberListFormatHtmlPartialTemplate += "        <div class=\"field\"><span>" + Localization.Decimal + "<\/span><\/div>";
        numberListFormatHtmlPartialTemplate += "        <div class=\"input\"><input id=\"FormatDecimalSelect\" class=\"eaDropdown eaDropdownSize40\" \/><\/div>";
        numberListFormatHtmlPartialTemplate += "    <\/div>";
    }
    numberListFormatHtmlPartialTemplate += "<\/div>";

    return numberListFormatHtmlPartialTemplate;
};

var normalListFormatHtmlPartialTemplate = function () {

    var normalListFormatHtmlPartialTemplate = "<div class=\"FieldFormatList\">";
    normalListFormatHtmlPartialTemplate += "    <div class=\"row\">";
    normalListFormatHtmlPartialTemplate += "        <div class=\"field\"><span>" + Captions.FieldFormat_Notation + "<\/span><\/div>";
    normalListFormatHtmlPartialTemplate += "        <div class=\"input\"><input id=\"format\" class=\"eaDropdown eaDropdownSize40\" \/><\/div>";
    normalListFormatHtmlPartialTemplate += "    <\/div>";
    normalListFormatHtmlPartialTemplate += "<\/div>";

    return normalListFormatHtmlPartialTemplate;
};

var timeListFormatHtmlPartialTemplate = function () {
    var timeListFormatHtmlPartialTemplate = "<div class=\"FieldFormatList\">";
    timeListFormatHtmlPartialTemplate += "    <div class=\"row\">";
    timeListFormatHtmlPartialTemplate += "        <div class=\"field\"><span>" + Captions.Label_FieldFormat_Seconds + "<\/span><\/div>";
    timeListFormatHtmlPartialTemplate += "        <div class=\"input\"><input id=\"FormatSecondsSelect\" class=\"eaDropdown eaDropdownSize40\" \/><\/div>";
    timeListFormatHtmlPartialTemplate += "    <\/div>";
    timeListFormatHtmlPartialTemplate += "<\/div>";
    return timeListFormatHtmlPartialTemplate;
};

var listFormatHtmlTemplate = function (dataType) {
    var listFormatHtmlTemplate = "<form>";
    listFormatHtmlTemplate += "<div class=\"FieldFormatList FieldFormatAlias\">";
    listFormatHtmlTemplate += "    <div class=\"row\">";
    listFormatHtmlTemplate += "        <label class=\"field\">" + Localization.Name + "<\/label>";
    listFormatHtmlTemplate += "        <div class=\"input\"><input id=\"AliasName\" type=\"text\" class=\"eaText eaTextSize40\" maxlength=\"255\" \/><\/div>";
    listFormatHtmlTemplate += "    <\/div>";
    listFormatHtmlTemplate += "<\/div>";

    var separator = "<div class=\"StatSeparate\"><\/div>";
    if (WC.FormatHelper.IsNumberFieldType(dataType)) {
        listFormatHtmlTemplate += separator;
        listFormatHtmlTemplate += numberListFormatHtmlPartialTemplate(dataType);
    }
    else if (WC.FormatHelper.IsFieldTypeHasTime(dataType)) {
        listFormatHtmlTemplate += separator;
        listFormatHtmlTemplate += timeListFormatHtmlPartialTemplate();
    }
    else if (dataType === enumHandlers.FIELDTYPE.ENUM) {
        listFormatHtmlTemplate += separator;
        listFormatHtmlTemplate += normalListFormatHtmlPartialTemplate();
    }

    listFormatHtmlTemplate += "    <div class=\"FieldFormatCheckDefault\">";
    listFormatHtmlTemplate += "        <div class=\"ThousandSeperateWrapper\">";
    listFormatHtmlTemplate += "                <input type=\"checkbox\" id=\"UseThousandSeperate\" name=\"thousandseparator\" value=\"true\"  data-bind=\"checked:  $root.ThousandSeparator, IndeterminatableChange: $root.ThousandSeparator\" \/>";
    listFormatHtmlTemplate += "                <span class=\"textStatus\">" + Localization.UserSettingLabelThousandSeparator + "<\/span>";
    listFormatHtmlTemplate += "        <\/div>";
    listFormatHtmlTemplate += "        <div class=\"UseAsDefaultWrapper\">";
    listFormatHtmlTemplate += "            <label>";
    listFormatHtmlTemplate += "                <input type=\"checkbox\" id=\"UseAsDefaultFormat\" name=\"savedefault\" value=\"true\"\/>";
    listFormatHtmlTemplate += "                <span class=\"label\">" + Localization.ListFormatSaveAsDefault + "<\/span>";
    listFormatHtmlTemplate += "                <span class=\"label\" id=\"FieldName\"><\/span>";
    listFormatHtmlTemplate += "            <\/label>";
    listFormatHtmlTemplate += "        <\/div>";
    listFormatHtmlTemplate += "    <\/div>";
    listFormatHtmlTemplate += "<\/form>";
    return listFormatHtmlTemplate;
};
