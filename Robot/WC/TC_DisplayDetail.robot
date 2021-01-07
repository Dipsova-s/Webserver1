*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Force Tags        	acc_wc

*** Variables ***
${VERIFY_SET_DEFAULT_DISPLAY}            [ROBOT] Verify Set Default Display
${TEST_VERIFY_DISPLAY_DESCRIPTION_WITH_MULTI_LANGUAGES}    [ROBOT] Test Verify Display Description With Multi Languages

*** Test Cases ***
Verify Set Default Display
    [Tags]              TC_C228795  acc_wc_aci
    [Documentation]     Verify the default display of the angle has been set to the default display
    ...                 Risk/coverage area: the display details
    Create Angle From Object List And Save    PD    ${VERIFY_SET_DEFAULT_DISPLAY}
    Create New List Display on Angle Page
    Set Angle Default Display
    Back To Search
    Search Angle From Search Page And Execute Angle    ${VERIFY_SET_DEFAULT_DISPLAY}
    ${selectedDisplay}    Get Current Display Name
    Should Be True    '${selectedDisplay}'=='New Display (1)'
    [Teardown]  Back To Search And Delete Angle Are Created    ${VERIFY_SET_DEFAULT_DISPLAY}

Verify Display Description With Multi Languages
    Create Angle From Object List And Save    PD    ${TEST_VERIFY_DISPLAY_DESCRIPTION_WITH_MULTI_LANGUAGES}
    
    Verify Edit Display Description    en    English Display Name    English Description
    Verify Edit Display Description    nl    Dutch Display Name    Dutch Description
    Verify Edit Display Description    fr    French Display Name    French Description

    Verify Edit Display Description    en    English Display Name Edited    English Description Edited
    Verify Edit Display Description    nl    Dutch Display Name Edited    Dutch Description Edited
    Verify Edit Display Description    fr    French Display Name Edited    French Description Edited

    [Teardown]  Back To Search And Delete Angle Are Created    ${TEST_VERIFY_DISPLAY_DESCRIPTION_WITH_MULTI_LANGUAGES}
