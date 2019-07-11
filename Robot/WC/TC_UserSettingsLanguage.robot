*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/API/API_UserSettings.robot
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          smoke_s    smk_wc_s

*** Variables ***
${NL_LANGUAGE_TEXT}                        Dutch
${EN_LANGUAGE_TEXT}                        English

*** Test Cases ***
Verify Change User Language
    [Setup]     Go to WC Then Login With EAViewer User
    Change User Language    ${EN_LANGUAGE_TEXT}
    ${en_caption}           Execute Javascript    return Captions.Drop_Here_To_Remove_This_Column
    Change User Language    ${NL_LANGUAGE_TEXT}
    ${nl_caption}           Execute Javascript    return Captions.Drop_Here_To_Remove_This_Column
    Should Be True          '${en_caption}' != '${nl_caption}'
    Change User Language    ${EN_LANGUAGE_TEXT}
    [Teardown]  Run Keyword     Reset UserSettings Language

*** Keywords ***
Reset UserSettings Language
    Create Context: Web
    ${path}    Execute JavaScript    return userModel.Data().user_settings;
    Update UserSettings Language    ${path}     USER_SETTINGS.json
