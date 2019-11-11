*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/API/API_Dashboard.robot

*** Keywords ***
Import Item From Directory
    [Arguments]    ${anglesPath}    ${ids}    ${dashboardsPath}=${EMPTY}
    Log   Clean up items
    Search Filter By Query String    sort=name&dir=asc&ids=${ids}&fq=facetcat_characteristics:(facet_isvalidated)
    ${validatedCount}    Get Number Of Search Results
    Run Keyword If    ${validatedCount}>0  Run Keywords
    ...   Click Select All Items from Search Result
    ...   Open Mass Change Popup
    ...   Click Set Not Validated Via Mass Change Popup
    ...   Click Save Mass Change
    ...   Click Close Mass Change Report Popup

    Search Filter By Query String    sort=name&dir=asc&ids=${ids}
    ${itemCount}    Get Number Of Search Results
    Run Keyword If    ${itemCount}>0    Delete All Search Result Items

    Log   Importing Angles
    ${cacheUris}  Set Variable   {}
    @{angleFiles}  List Files In Directory  ${anglesPath}   *.json
    : FOR    ${file}    IN    @{angleFiles}
    \   ${text}    Get File    ${anglesPath}${file}
    \   ${data}    Execute JavaScript
    \   ...    var angle=${text};
    \   ...    var dafaultDisplay=angle.display_definitions.findObject('uri', angle.angle_default_display);
    \   ...    if (dafaultDisplay) {
    \   ...        angle.angle_default_display=dafaultDisplay.id;
    \   ...    }
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

    Run Keyword If    '${dashboardsPath}'!='${EMPTY}'    Import Dashboard From Directory    ${dashboardsPath}    ${cacheUris}

Import Dashboard From Directory
    [Arguments]    ${dashboardsPath}    ${cacheUris}
    Log   Importing Dashboards
    @{dashboardFiles}  List Files In Directory  ${dashboardsPath}   *.json
    : FOR    ${file}    IN    @{dashboardFiles}
    \   ${text}    Get File    ${dashboardsPath}${file}
    \   ${data}    Execute JavaScript
    \   ...    var dashboard=${text};
    \   ...    var cache=${cacheUris};
    \   ...    $.each(dashboard.widget_definitions, function(i, widget){ widget.angle=cache[widget.angle];widget.display=cache[widget.display]; });
    \   ...    return JSON.stringify(dashboard);
    \   Create Context: Web
    \   Create Dashboard  ${data}
