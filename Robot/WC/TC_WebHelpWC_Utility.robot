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
    ${ids}    Set Variable    WEBHELP_WC_*
    Import Item From Directory    ${AnglesPath}    ${ids}    ${DashboardsPath}

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