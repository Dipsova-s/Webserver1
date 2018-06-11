*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Variables ***
${TEST_VERIFY_FIELD_SETTINGS_ANGLE_NAME}              Angle For General Test
${TEST_VERIFY_FIELD_SETTINGS_DISPLAY_NAME}            Test Pivot All Fields

*** Test Cases ***
Verify Field Setting All Field Types
    Search By Text And Expect In Search Result    ${TEST_VERIFY_FIELD_SETTINGS_ANGLE_NAME}
    Execute First Search Item In Edit Mode
    Click Toggle Angle
    Change Display By Name    ${TEST_VERIFY_FIELD_SETTINGS_DISPLAY_NAME}
    Sleep   ${TIMEOUT_LARGEST}   Wait make sure warning popup was presented
    ${statusWarningPopup} =   Is Element Visible    ${btnPopupNotificationWarningAngle}
    Run Keyword If    ${statusWarningPopup} == False    Verify Field Setting All Format



