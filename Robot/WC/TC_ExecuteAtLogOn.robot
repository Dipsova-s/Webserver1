*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Test Teardown       Logout
Force Tags        	acceptance_s     acc_wc_s


*** Variables ***
${TEST_ITEM_EXECUTE_AT_LOGON}      [ROBOT] Test Item Execute at logon

*** Test Cases ***
Verify Item Execute At Logon Work
    Login And Create Angle By 2 Objects From Object List    PD    ${TEST_ITEM_EXECUTE_AT_LOGON}
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
    Search By Text And Expect In Search Result     ${TEST_ITEM_EXECUTE_AT_LOGON}
    Delete All Search Result Items
    Sleep    ${TIMEOUT_LARGEST}
    Element Should Not Contain    ${gridSearchResult}    ${TEST_ITEM_EXECUTE_AT_LOGON}
    ${windows}    List Windows
    Length Should Be     ${windows}     2