*** Settings ***
Resource            ${EXECDIR}/WC/POM/WebHelp/WebHelp.robot

*** Keywords ***
Suite Setup WC WebHelp
    Initialize WebHelp    ${WEBHELP_WC_OUTPUT}

Test Setup WC WebHelp
    [Arguments]  ${username}  ${password}  ${langauge}  ${folder}
    # output by specific language
    ${directory}  Replace String  ${WEBHELP_WC_OUTPUT}  ${WEBHELP_COMMON_FOLDER}  ${folder}
    Create Directory     ${directory}
    Empty Directory      ${directory}
    Set Test Variable    ${WEBHELP_LANGUAGE_CODE}    ${langauge}
    Set Test Variable    ${WEBHELP_LANGUAGE_OUTPUT}    ${directory}

    # login
    Open Browser in Sandbox Mode
    Go To    ${URL_WC}
    Login To WC    ${username}    ${password}

    # set sizes
    ${width}   ${height}    Get Window Size
    Set Test Variable    ${WINDOW_WIDTH}    ${width}
    Set Test Variable    ${WINDOW_HEIGHT}    ${height}

Test Teardown WC WebHelp
    Logout WC Then Close Browser