*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          smk_wc_s

*** Test Cases ***
Verify Change User Language
    [Documentation]    This test case Verifyies user language settings
    [Tags]    TC_C231829
    [Setup]     Go to WC Then Login With EAViewer User
    Change User Language    ${EN_LANGUAGE_TEXT}
    ${en_caption}           Execute Javascript    return Captions.Drop_Here_To_Remove_This_Column
    Change User Language    ${NL_LANGUAGE_TEXT}
    ${nl_caption}           Execute Javascript    return Captions.Drop_Here_To_Remove_This_Column
    Should Be True          '${en_caption}' != '${nl_caption}'
    Change User Language    ${EN_LANGUAGE_TEXT}
    [Teardown]  Run Keyword     Reset UserSettings Language
