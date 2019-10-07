*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/API/API_Dashboard.robot
Suite Setup         Go to WC Then Login With Admin User
Suite Teardown      Logout WC Then Close Browser

*** Variables ***
${AnglesPath}       ${EXECDIR}/webhelp_items/angles/
${DashboardsPath}   ${EXECDIR}/webhelp_items/dashboards/

*** Test Cases ***
WebHelp WC Import Items
    [Tags]    webhelp_import
    Log   Clean up items
    Search Filter By Query String    ids=WEBHELP_WC_*&fq=facetcat_characteristics:(facet_isvalidated)
    ${validatedCount}    Get Number Of Search Results
    Run Keyword If    ${validatedCount}>0  Run Keywords
    ...   Click Select All Items from Search Result
    ...   Open Mass Change Popup
    ...   Click Set Not Validated Via Mass Change Popup
    ...   Click Save Mass Change
    ...   Click Close Mass Change Report Popup

    Search Filter By Query String    ids=WEBHELP_WC_*
    ${itemCount}    Get Number Of Search Results
    Run Keyword If    ${itemCount}>0    Delete All Search Result Items

    Log   Importing Angles from "webhelp_items/angles"
    ${cacheUris}  Set Variable   {}
    @{angleFiles}  List Files In Directory  ${AnglesPath}   *.json
    : FOR    ${file}    IN    @{angleFiles}
    \   ${text}    Get File    ${AnglesPath}${file}
    \   ${data}    Execute JavaScript
    \   ...    var angle=${text};
    \   ...    var dafaultDisplay=angle.display_definitions.findObject('uri', angle.angle_default_display).id;
    \   ...    angle.angle_default_display=dafaultDisplay;
    \   ...    return JSON.stringify(angle);
    \   Create Context: Web
    \   ${angle}   Create Angle  /models/1  ${data}
    \   ${newText}   Stringify Json    ${angle}
    \   ${cacheUris}   Execute JavaScript
    \   ...    var angle=${text};
    \   ...    var newAngle=${newText};
    \   ...    var cache=${cacheUris};
    \   ...    cache[angle.uri]=newAngle.uri;
    \   ...    $.each(angle.display_definitions, function(i,display){ cache[display.uri]=newAngle.display_definitions[i].uri; });
    \   ...    return JSON.stringify(cache);

    Log   Importing Angles from "webhelp_items/dashboards"
    @{dashboardFiles}  List Files In Directory  ${DashboardsPath}   *.json
    : FOR    ${file}    IN    @{dashboardFiles}
    \   ${text}    Get File    ${DashboardsPath}${file}
    \   ${data}    Execute JavaScript
    \   ...    var dashboard=${text};
    \   ...    var cache=${cacheUris};
    \   ...    $.each(dashboard.widget_definitions, function(i, widget){ widget.angle=cache[widget.angle];widget.display=cache[widget.display]; });
    \   ...    return JSON.stringify(dashboard);
    \   Create Context: Web
    \   Create Dashboard  ${data}

WebHelp WC Export Items
    [Tags]    webhelp_export
    Log   Clean up items
    Remove File    ${AnglesPath}*.json
    Remove File    ${DashboardsPath}*.json
    
    Log   Getting items
    Search Filter By Query String    ids=WEBHELP_WC_*
    Click Select All Items from Search Result
    @{items}    Get Selected Items Data
    : FOR    ${item}    IN    @{items}
    \   ${itemId}    Get From Dictionary    ${item}    id
    \   ${itemType}    Get From Dictionary    ${item}    type
    \   ${itemUri}    Get From Dictionary    ${item}    uri
    \   ${file}   Set Variable If   '${itemType}' == 'angle'  ${AnglesPath}${itemId}.json  ${DashboardsPath}${itemId}.json
    \   ${handler}   Set Variable If  '${itemType}' == 'angle'  Get Angle   Get Dashboard
    \   Create Context: Web
    \   ${itemData}   Run Keyword   ${handler}   ${itemUri}?multilingual=yes
    \   ${content}   Stringify Json   ${itemData}
    \   ${text}   Execute JavaScript   return JSON.stringify(${content}, null, 4);
    \   Append To File   ${file}   ${text}