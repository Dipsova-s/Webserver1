*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Verify Field Setting All Field Types
    [Tags]  acc_wc_aci
    Search By Text And Expect In Search Result    Angle For General Test
    Execute First Search Item In Edit Mode
    Click Toggle Angle
    Change Display By Name    Test Pivot All Fields
    Sleep   ${TIMEOUT_LARGEST}   Wait make sure warning popup was presented
    ${statusWarningPopup}   Is Element Visible    ${btnPopupNotificationWarningAngle}
    Run Keyword If    ${statusWarningPopup} == False    Verify Field Setting All Format



