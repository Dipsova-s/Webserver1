var executeParameterHtmlTemplate = function () {
    var executeParameterHtmlTemplate = "";
    executeParameterHtmlTemplate += "<div id=\"ExecuteParameterDefinitionArea\" class=\"definitionArea angleDefinitionArea\">";
    executeParameterHtmlTemplate += "    <div class=\"DefInfo classesInfo angleInfo\">";
    executeParameterHtmlTemplate += "        <label>" + Localization.StartObject + ":<\/label>";
    executeParameterHtmlTemplate += "        <!-- ko stopBinding: true -->";
    executeParameterHtmlTemplate += "        <div id=\"ExecuteParameterBaseClassList\" class=\"widgetDetailsWrapper objectName\"><\/div>";
    executeParameterHtmlTemplate += "        <!-- \/ko -->";
    executeParameterHtmlTemplate += "    <\/div>";
    executeParameterHtmlTemplate += "    <div class=\"DefInfo displayInfo\">";
    executeParameterHtmlTemplate += "        <label>" + Localization.DisplayName + ":<\/label>";
    executeParameterHtmlTemplate += "        <div class=\"objectName\"><\/div>";
    executeParameterHtmlTemplate += "    <\/div>";
    executeParameterHtmlTemplate += "    <div class=\"StatSeparate\"><\/div>";
    executeParameterHtmlTemplate += "    <div class=\"DefInfo\">";
    executeParameterHtmlTemplate += "        <label>" + Localization.AppliedFilterLinesAndFollowUps + "<\/label>";
    executeParameterHtmlTemplate += "        <div id=\"FilterAngleWrapper\"><\/div>";
    executeParameterHtmlTemplate += "        <div id=\"FilterDisplayWrapper\"><\/div>";
    executeParameterHtmlTemplate += "    <\/div>";
    executeParameterHtmlTemplate += "<\/div>";

    return executeParameterHtmlTemplate;
};
