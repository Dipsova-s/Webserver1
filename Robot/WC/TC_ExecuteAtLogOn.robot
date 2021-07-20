*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags        	acc_wc_s

*** Test Cases ***
Verify Item Execute At Logon Work
    [Documentation]     This test verifies that cheking execute at login checkbox of display makes it present in actions at login
    [Tags]  acc_wc_aci_s   TC_C723
    ${angleName}  Set Variable  [ROBOT] Test Item Execute at logon
    Create Angle From Object List And Save    PD    ${angleName}
    ${numberOfExecutedItemBefore}    Get Number Of Execute At Login Items
    Set Execute On Login
    ${numberOfExecutedItemAfter}    Get Number Of Execute At Login Items
    Should Not Be Equal     ${numberOfExecutedItemBefore}    ${numberOfExecutedItemAfter}
    Logout
    Login To WC By Power User
	Sleep    ${TIMEOUT_LARGEST}
    Search By Text And Expect In Search Result     ${angleName}
    Switch Window    NEW
    ${angleNameWithSetExecuteAtLogin}    Execute Javascript    return jQuery("#SectionInfo .displayNameContainer .name").text() 
    Switch Window    MAIN
    ${itemCount}    Get Number Of Search Results
    Delete All Search Result Items      ${itemCount}
    Sleep    ${TIMEOUT_LARGEST}
    Should be Equal     ${angleName}    ${angleNameWithSetExecuteAtLogin}
    Element Should Not Contain    ${gridSearchResult}    ${angleName}
    ${windows}    Get Window Handles
    Length Should Be     ${windows}     2