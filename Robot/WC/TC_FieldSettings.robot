*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Verify Field Setting All Field Types
    [Documentation]     This test verifies editing and saving already present fields under Pivot options
    [Tags]  acc_wc_aci  TC_C231309
    Search By Text And Expect In Search Result    Angle For General Test
    Execute First Search Item In Edit Mode
    Change Display By Name    Test Pivot All Fields
    Sleep   ${TIMEOUT_LARGEST}   Wait make sure warning popup was presented
    ${statusWarningPopup}   Is Element Visible    ${btnPopupNotificationWarningAngle}
    Run Keyword If    ${statusWarningPopup} == False    Verify Field Setting All Format