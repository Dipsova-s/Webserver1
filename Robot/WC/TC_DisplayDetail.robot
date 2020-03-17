*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags        	acc_wc

*** Variables ***
${VERIFY_SET_DEFAULT_DISPLAY}            [ROBOT] Verify Set Default Display
${TEST_VERIFY_DISPLAY_DESCRIPTION_WITH_MULTI_LANGUAGES}    [ROBOT] Test Verify Display Description With Multi Languages

*** Test Cases ***
Verify Set Default Display
    [Tags]              TC_C228795  acc_wc_aci
    [Documentation]     Verify the default display of the angle has been set to the default display
    ...                 Risk/coverage area: the diplay details
    Create Angle From Object List And Save    PD    ${VERIFY_SET_DEFAULT_DISPLAY}
    Create New Display on Angle Page    list
    Click Edit Display
    Click Checkbox Default Display
    Save Display Detail From Popup
    Back To Search
    Search Angle From Search Page And Execute Angle    ${VERIFY_SET_DEFAULT_DISPLAY}
    ${selectedDisplay}    Get Selected Display Name
    Should Be True    '${selectedDisplay}'=='New Display (1)'
    [Teardown]    Back To Search And Delete Angle Are Created    ${VERIFY_SET_DEFAULT_DISPLAY}

Verify Display Description With Multi Languages
    Create Angle From Object List And Save    PD    ${TEST_VERIFY_DISPLAY_DESCRIPTION_WITH_MULTI_LANGUAGES}
    Click Edit Display
    Click Display Detail General Tab
    Input Display Name    English Display Name
    Input Display Description    English Description
    Click Add Language Button on Display
    Selct Dutch Language From Language List on Display
    Input Display Name    Dutch Display Name
    Input Display Description    Dutch Description
    Click Add Language Button on Display
    Selct French Language From Language List on Display
    Input Display Name    French Display Name
    Input Display Description    French Description
    Save Display Detail From Popup

    Click Edit Display
    Click Display Detail General Tab
    Select English Language On Display
    Display Name Should Be Equal    English Display Name
    Display Description Should Be Equal    English Description

    Select Dutch Language On Display
    Display Name Should Be Equal    Dutch Display Name
    Display Description Should Be Equal    Dutch Description

    Select French Language On Display
    Display Name Should Be Equal    French Display Name
    Display Description Should Be Equal    French Description

    Select English Language On Display
    Input Display Description    ${EMPTY}
    Save Display Detail From Popup
    Click Edit Display
    Click Display Detail General Tab
    Display English Language Should Be Available
    Close Display Detail Popup
    Back To Search And Delete Angle Are Created    ${TEST_VERIFY_DISPLAY_DESCRIPTION_WITH_MULTI_LANGUAGES}
