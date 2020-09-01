*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/API/API_Dashboard.robot

*** Keywords ***
Import Item From Directory
    [Arguments]    ${anglesPath}    ${ids}    ${dashboardsPath}=${EMPTY}
    ${model}  Set Variable  /models/1
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

    Log   Importing 
    @{angleFiles}  Create List
    @{files}  List Files In Directory  ${anglesPath}   *.json
    : FOR    ${file}    IN    @{files}
    \   Append To List   ${angleFiles}    ${anglesPath}${file}
    ${cacheUris}  Import Angle From Files  ${model}  ${angleFiles}

    Run Keyword If    '${dashboardsPath}'!='${EMPTY}'    Import Dashboard From Directory    ${model}    ${dashboardsPath}    ${cacheUris}

Import Angle From Files
    [Arguments]  ${model}  ${files}  ${user}=${AdminUsername}  ${pwd}=${Password}
    ${cacheUris}  Set Variable   {}
    : FOR    ${file}    IN    @{files}
    \   ${text}    Get File    ${file}
    \   ${data}    Execute JavaScript
    \   ...    var angle=${text};
    \   ...    delete angle.created;
    \   ...    var dafaultDisplay=angle.display_definitions.findObject('uri', angle.angle_default_display);
    \   ...    if (dafaultDisplay) {
    \   ...        angle.angle_default_display=dafaultDisplay.id;
    \   ...    }
    \   ...    return JSON.stringify(angle);
    \   Create Context: Web    ${user}  ${pwd}
    \   ${angle}   Create Angle  ${model}  ${data}
    \   ${newText}   Stringify Json    ${angle}
    \   ${cacheUris}   Execute JavaScript
    \   ...    var angle=${text};
    \   ...    var newAngle=${newText};
    \   ...    var cache=${cacheUris};
    \   ...    cache[angle.uri]=newAngle.uri;
    \   ...    $.each(angle.display_definitions, function(i,display){ cache[display.uri]=newAngle.display_definitions[i].uri; });
    \   ...    return JSON.stringify(cache);
    [Return]  ${cacheUris}

Import Dashboard From Directory
    [Arguments]  ${model}  ${dashboardsPath}  ${cacheUris}  ${user}=${AdminUsername}  ${pwd}=${Password}
    Log   Importing Dashboards
    @{dashboardFiles}  List Files In Directory  ${dashboardsPath}   *.json
    : FOR    ${file}    IN    @{dashboardFiles}
    \   Import Dashboard From File  ${model}  ${dashboardsPath}${file}  ${cacheUris}  ${user}  ${pwd}

Import Dashboard From File
    [Arguments]  ${model}  ${file}  ${cacheUris}  ${user}=${AdminUsername}  ${pwd}=${Password}
    ${text}    Get File    ${file}
    ${data}    Execute JavaScript
    ...    var cache=${cacheUris};
    ...    var dashboard=${text};
    ...    delete dashboard.created;
    ...    dashboard.model='${model}';
    ...    $.each(dashboard.widget_definitions, function(i, widget){ widget.angle=cache[widget.angle];widget.display=cache[widget.display]; });
    ...    return JSON.stringify(dashboard);
    Create Context: Web    ${user}  ${pwd}
    ${dahboard}  Create Dashboard  ${data}
    ${dahboardUri}  Get Uri From Response    ${dahboard}
    [Return]  ${dahboardUri}

Import Angle By API
    [Documentation]  Import Angle by using API
    ...    ${model} model uri for dashboard and angles
    ...    ${data} data or a JSON file contain angle data
    [Arguments]  ${model}  ${data}  ${user}=${AdminUsername}  ${pwd}=${Password}
    Create Context: Web    ${user}  ${pwd}
    ${angleData}      Create Angle    ${model}  ${data}
    ${angleUri}       Get Uri From Response    ${angleData}
    Add Clean Up Item    ${angleUri}?forced=true

Import Dashboard By API
    [Documentation]  Import Dashboard with Angles by using API
    ...    ${model} model uri for dashboard and angles
    ...    ${dashboardFile} response from (GET /dashboards/x?multilingual=yes)
    ...    ${angleFiles} response from (GET /dashboards/x/angles?multilingual=yes)
    [Arguments]  ${model}  ${dashboardFile}  ${angleFile}  ${user}=${AdminUsername}  ${pwd}=${Password}
    ${dataPath}  Set Variable  ${EXECDIR}/WC/API/Mock/

    # Angles
    ${text}    Get File    ${dataPath}${angleFile}
    ${angles}  Execute JavaScript
    ...   var angles=[];
    ...   var raw=${text};
    ...   $.each(raw.angles, function(index, angle){
    ...       var dafaultDisplay=angle.display_definitions.findObject('uri', angle.angle_default_display);
    ...       if (dafaultDisplay) angle.angle_default_display=dafaultDisplay.id;
    ...       delete angle.created;
    ...       angles.push(JSON.stringify(angle));
    ...   });
    ...   return angles;

    ${cacheUris}  Set Variable   {}
    : FOR    ${angle}    IN    @{angles}
    \   Create Context: Web    ${user}  ${pwd}
    \   ${data}   Create Angle  ${model}  ${angle}
    \   ${angleUri}       Get Uri From Response    ${data}
    \   Add Clean Up Item  ${angleUri}?forced=true
    \   ${text}   Stringify Json    ${data}
    \   ${cacheUris}   Execute JavaScript
    \   ...    var angle=${angle};
    \   ...    var newAngle=${text};
    \   ...    var cache=${cacheUris};
    \   ...    cache[angle.uri]=newAngle.uri;
    \   ...    $.each(angle.display_definitions, function(i,display){ cache[display.uri]=newAngle.display_definitions[i].uri; });
    \   ...    return JSON.stringify(cache);

    # Dashboard
    ${dashboardUri}  Import Dashboard From File  ${model}  ${dataPath}${dashboardFile}  ${cacheUris}  ${user}  ${pwd}
    Add Clean Up Item  ${dashboardUri}?forced=true  prepend=${True}

Add Clean Up Item
    [Arguments]  ${url}  ${prepend}=${False}
    ${setVariable}    Run Keyword And Return Status    Variable Should Not Exist    \${importedItems}
    Run Keyword If    ${setVariable}    Set Test Variable    	@{importedItems}    @{EMPTY}
    Run Keyword If  ${prepend}==${False}  Append To List      ${importedItems}    ${url}
    Run Keyword If  ${prepend}==${True}   Insert Into List    ${importedItems}    0  ${url}

Clean Up All Items
    Clean Up Items     Web  ${importedItems}

Clean Up Items And Go To Search Page
    Clean Up All Items
    Go to Search Page