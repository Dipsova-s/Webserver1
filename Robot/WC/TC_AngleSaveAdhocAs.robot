*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go to                   ${URL_WC}
Force Tags          acceptance    acc_wc

*** Variables ***
${TEST_VERIFY_SAVE_ANGLE_ADHOC_AS_NAME}     [ROBOT] Verify Adhoc Angle Allow To Save Display As
${TEST_VERIFY_SAVE_ANGLE_ADHOC_AS_FIELD}    ObjectType

*** Test Cases ***
Verify Save Adhoc Angle As
    Login And Create Angle By 2 Objects From Object List    PD    ${TEST_VERIFY_SAVE_ANGLE_ADHOC_AS_NAME}
    Wait Progress Bar Closed
    Wait Until List Display Loaded
    Create Chart From List Header Column    ObjectType    ObjectType
    Click Angle Dropdown Actions Save Display As
    Click Check Add To New Angle Checkbox
    ${displayName}    Get Display Name In Save Display As Popup
    Should Not End With    ${displayName}    (copy)
    ${angleName}    Get Angle Name In Save Display As Popup
    Should End With    ${angleName}    (copy)
    Click Un-check Add To New Angle Checkbox
    Click Save Display As Button
    Set Angle to Template
    Back To Search
    Search By Text And Expect In Search Result    ${TEST_VERIFY_SAVE_ANGLE_ADHOC_AS_NAME}
    Open Angle From First Angle in Search Page    ${TEST_VERIFY_SAVE_ANGLE_ADHOC_AS_NAME}
    Wait Angle Page Document Loaded
    Wait Angle Detail Document Loaded
    Close Angle Detail Popup
    Open Display Dropdown
    ${displayCount}    Get Elements Count    ${ddlSelectDisplayItems}
    Should Be True    ${displayCount}==2
    Click Angle Dropdown Actions Save Display As
    Checkbox Should Be Selected    ${chkAddToNewAngle}
    Element Should Be Disabled    ${chkAddToNewAngle}
    Element Should Contain    ${popupSaveDisplayAs}    Only this Display will be added to your new Angle
    ${displayName}    Get Display Name In Save Display As Popup
    Should Not End With    ${displayName}    (Copy)
    ${angleName}    Get Angle Name In Save Display As Popup
    Should Not End With    ${angleName}    (Copy)
    Input Angle Name In Save Angle As Popup   ${TEST_VERIFY_SAVE_ANGLE_ADHOC_AS_NAME} (copy)
    Click Save Display As Button
    Open Display Dropdown
    ${displayCount}    Get Elements Count    ${ddlSelectDisplayItems}
    Should Be True    ${displayCount}==1
    Back To Search And Delete Angle Are Created    ${TEST_VERIFY_SAVE_ANGLE_ADHOC_AS_NAME}