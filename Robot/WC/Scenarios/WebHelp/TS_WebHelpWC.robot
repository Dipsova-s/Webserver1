*** Settings ***
Resource            ${EXECDIR}/WC/POM/WebHelp/WebHelp.robot

*** Keywords ***
Suite Setup WC WebHelp
    Initialize WebHelp    ${WC_HELP_IMAGE_PATH}

Test Setup WC WebHelp
    [Arguments]  ${username}  ${password}  ${langauge}  ${folder}
    # output by specific language
    ${directory}  Replace String  ${WC_HELP_IMAGE_PATH}  ${WEBHELP_COMMON_FOLDER}  ${folder}
    Create Directory     ${directory}
    Empty Directory      ${directory}
    Set Test Variable    ${WEB_HELP_LANGUAGE_CODE}    ${langauge}
    Set Test Variable    ${WEB_HELP_LANGUAGE_OUTPUT}    ${directory}

    # login
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC    ${username}    ${password}

    # change language
    Create Context: Web
    ${path}    Execute JavaScript    return userModel.Data().user_settings;
    Update UserSettings Language  ${path}  {"default_language":"${WEB_HELP_LANGUAGE_CODE}"}
    Reload Search Page

    ${width}   ${height}    Get Window Size
    Set Test Variable    ${WINDOW_WIDTH}    ${width}
    Set Test Variable    ${WINDOW_HEIGHT}    ${height}

Test Teardown WC WebHelp
    Logout WC Then Close Browser

