*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags        	acc_wc_s

*** Test Cases ***
Verify Item Execute At Logon Work
    [Tags]  acc_wc_aci_s
    ${angleName}  Set Variable  [ROBOT] Test Item Execute at logon
    Create Angle From Object List And Save    PD    ${angleName}
    ${numberOfExecutedItemBefore}    Get Number Of Execute At Login Items
    Click Edit Display
    Click Display Detail General Tab
    Click Checkbox Execute At Login
    Save Display Detail From Popup
    ${numberOfExecutedItemAfter}    Get Number Of Execute At Login Items
    Should Not Be Equal     ${numberOfExecutedItemBefore}    ${numberOfExecutedItemAfter}
    Logout
    Login To WC By Power User
	Sleep    ${TIMEOUT_LARGEST}
    Search By Text And Expect In Search Result     ${angleName}
    Delete All Search Result Items
    Sleep    ${TIMEOUT_LARGEST}
    Element Should Not Contain    ${gridSearchResult}    ${angleName}
    ${windows}    Get Window Handles
    Length Should Be     ${windows}     2