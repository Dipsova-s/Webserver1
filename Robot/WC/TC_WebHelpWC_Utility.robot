*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/resources/WebhelpSettings.robot
Resource            ${EXECDIR}/WC/API/API_Angle.robot
Resource            ${EXECDIR}/WC/API/API_Dashboard.robot
Resource            ${EXECDIR}/WC/API/API_User.robot
Resource            ${EXECDIR}/WC/API/API_Model.robot
Resource            ${EXECDIR}/WC/API/API_Package.robot
Suite Setup         Go to WC Then Login With Admin User
Suite Teardown      Logout WC Then Close Browser

*** Test Cases ***
WebHelp WC Setup
    [Tags]    webhelp_setup_i
    # import users
    Create Context: Web
    Import Users  ${WEBHELP_USERS}

    # enable model languages
    ${languages}  Create List
    :FOR  ${user}  IN  @{WEBHELP_USERS}
    \  Append To List  ${languages}  ${user.language}
    ${languagesData}  Stringify Json  ${languages}
    Create Context: Web
    Enable Model Languages  /models/1  ${languagesData}

    # activate "DiagramHelp" package
    Create Context: Web
    Activate Model Package  /models/1/packages  DiagramHelp
    Create Context: Web
    Activate Model Package  /models/1/packages  P2P
    Create Context: Web
    Activate Model Package  /models/1/packages  S2D

    # uncheck Show item ID option
    Go To Web Server Settings Page
    Select the Show item IDs check box  False
    Click Save Web Server Setting

    # upload movies
    Run Keyword And Ignore Error  Remove Directory  ${WEBHELP_MOVIES_TARGET}movies/  ${True}
    ${passed}  Run Keyword And Return Status  Copy Directory  ${WEBHELP_MOVIES_PATH}  ${WEBHELP_MOVIES_TARGET}
    Run Keyword If	${passed}==${False}  Fail  Cannot to copy movies to target directory, you may need to run as Administrator!

WebHelp WC Import Items
    [Tags]    webhelp_import  webhelp_setup
    ${ids}    Set Variable    WEBHELP_WC_*
    Import Item From Directory    ${WEBHELP_ANGLES_PATH}    ${ids}    ${WEBHELP_DASHBOARDS_PATH}

WebHelp WC Export Items
    [Tags]    webhelp_export
    Log   Clean up items
    Remove File    ${WEBHELP_ANGLES_PATH}*.json
    Remove File    ${WEBHELP_DASHBOARDS_PATH}*.json
    
    Log   Getting items
    Search Filter By Query String    ids=WEBHELP_WC_*
    Click Select All Items from Search Result
    @{items}    Get Selected Items Data
    : FOR    ${item}    IN    @{items}
    \   ${itemId}    Get From Dictionary    ${item}    id
    \   ${itemType}    Get From Dictionary    ${item}    type
    \   ${itemUri}    Get From Dictionary    ${item}    uri
    \   ${file}   Set Variable If   '${itemType}' == 'angle'  ${WEBHELP_ANGLES_PATH}${itemId}.json  ${WEBHELP_DASHBOARDS_PATH}${itemId}.json
    \   ${handler}   Set Variable If  '${itemType}' == 'angle'  Get Angle   Get Dashboard
    \   Create Context: Web
    \   ${itemData}   Run Keyword   ${handler}   ${itemUri}?multilingual=yes
    \   ${content}   Stringify Json   ${itemData}
    \   ${text}   Execute JavaScript   return JSON.stringify(${content}, null, 4);
    \   Append To File   ${file}   ${text}