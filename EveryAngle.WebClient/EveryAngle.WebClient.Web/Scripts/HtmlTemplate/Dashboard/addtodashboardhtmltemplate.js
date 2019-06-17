var addToDashboardHtmlTemplate = function () {
    var addToDashboardHtmlTemplate = "";
    addToDashboardHtmlTemplate += "<div id=\"CreateNewDashboardArea\" class=\"popupTabPanel\">";
    addToDashboardHtmlTemplate += "    <div class=\"row\">";
    addToDashboardHtmlTemplate += "        <div class=\"field\">";
    addToDashboardHtmlTemplate += "            <label for=\"newDashboardRadioButton\">";
    addToDashboardHtmlTemplate += "                <input type=\"radio\" name=\"createDashboardType\" id=\"newDashboardRadioButton\" value=\"NewDashboard\" checked \/>";
    addToDashboardHtmlTemplate += "                <span class=\"label\">" + Captions.Label_Dashboard_AddToANewDashboard + "<\/span>";
    addToDashboardHtmlTemplate += "            <\/label>";
    addToDashboardHtmlTemplate += "        <\/div>";
    addToDashboardHtmlTemplate += "        <div class=\"input\">";
    addToDashboardHtmlTemplate += "            <input type=\"text\" id=\"dashboardNameTextbox\" class=\"eaText\" name=\"\" value=\"\" maxlength=\"255\" \/>";
    addToDashboardHtmlTemplate += "        <\/div>";
    addToDashboardHtmlTemplate += "    <\/div>";
    addToDashboardHtmlTemplate += "    <div class=\"row\">";
    addToDashboardHtmlTemplate += "        <div class=\"field\">";
    addToDashboardHtmlTemplate += "            <label for=\"exitingDashboardRadioButton\">";
    addToDashboardHtmlTemplate += "                <input type=\"radio\" name=\"createDashboardType\" id=\"exitingDashboardRadioButton\" value=\"ExitingDashboard\">";
    addToDashboardHtmlTemplate += "                <span class=\"label\">" + Captions.Label_Dashboard_AddToExistingDashboard + "<\/span>";
    addToDashboardHtmlTemplate += "            <\/label>";
    addToDashboardHtmlTemplate += "        <\/div>";
    addToDashboardHtmlTemplate += "        <div class=\"input\">";
    addToDashboardHtmlTemplate += "            <input id=\"dashboardDropdownlist\" class=\"eaDropdown\" \/>";
    addToDashboardHtmlTemplate += "        <\/div>";
    addToDashboardHtmlTemplate += "    <\/div>";
    addToDashboardHtmlTemplate += "<\/div>";
    addToDashboardHtmlTemplate += "";
    return addToDashboardHtmlTemplate;
};
