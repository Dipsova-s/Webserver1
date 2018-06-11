*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acceptance    acc_wc

*** Variables ***
${TEST_ANGLE_EXECUTE_PARAMETER}      [ROBOT] Verify Execution Parameters When Argument Contains Space
${TEST_ANGLE_EXECUTE_PARAMETER2}     [ROBOT] Verify Execution Parameters When Argument Is Empty
${TEST_ANGLE_EXECUTE_PARAMETER3}     [ROBOT] Verify Execution Parameters With Compare Field
${TEST_ANGLE_EXECUTE_PARAMETER4}     [ROBOT] Verify Execution Parameters With & Char


*** Test Cases ***
Verify Execution Parameters When Argument Contains Space Test
    Create Angle From Object List And Save    PD    ${TEST_ANGLE_EXECUTE_PARAMETER}
    Verify Filter With Execute Parameter To List Display    text    is equal to    Vendor__NameAndDescription    Description
    ${numberOfObject}    Get Number Of Object
    Click Angle Dropdown Actions Save Existing Display
    Back To Search
    Search By Text And Expect In Search Result    ${TEST_ANGLE_EXECUTE_PARAMETER}
    Open Angle From First Angle in Search Page    ${TEST_ANGLE_EXECUTE_PARAMETER}
    Wait Angle Page Document Loaded
    ${numberOfObjectAfterExecuteParameter}    Get Number Of Object
    Should Be True    ${numberOfObject}==${numberOfObjectAfterExecuteParameter}
    Back To Search And Delete Angle Are Created    ${TEST_ANGLE_EXECUTE_PARAMETER}

Verify Execution Parameters When Argument Is Empty
    Create Angle From Object List And Save    PD    ${TEST_ANGLE_EXECUTE_PARAMETER2}
    Click Edit Angle
    Click Angle Detail Definition Tab
    Add Filter From Angle Details Popup    Execution    ExecutionStatus
    Choose Dropdown Filter Operator In Definition Tab    is in list
    Click Execute Parameter To Filter
    Click Save Angle
    Back To Search
    Search By Text And Expect In Search Result    ${TEST_ANGLE_EXECUTE_PARAMETER2}
    Execute First Search Item In Edit Mode
    Back To Search And Delete Angle Are Created    ${TEST_ANGLE_EXECUTE_PARAMETER2}

Verify Execution Parameters With Compare Field Test
    Create Adhoc Angle From Object List    PD    ${TEST_ANGLE_EXECUTE_PARAMETER3}
    Click Angle Detail Definition Tab
    Add Filter From Angle Details Popup    Material    MaterialValue
    Choose Dropdown Filter Operator In Definition Tab    is equal to
    Click Select Field Button In Definition Tab
    Add Field By Search From Field Chooser    Invoiced    InvoicedValue
    Click Execute Parameter To Filter
    Click Save Angle
    Back To Search
    Search By Text And Expect In Search Result    ${TEST_ANGLE_EXECUTE_PARAMETER3}
    Click Link Item From Search Result Not Execute Popup    ${TEST_ANGLE_EXECUTE_PARAMETER3}
    Wait Until Angle Execute Parameters Popup Loaded
    Add Compare Filter From Angle Details Popup    Item     PurchaseOrderLine__ItemValue
    Click Submit Angle Execution Parameters
    Back To Search And Delete Angle Are Created    ${TEST_ANGLE_EXECUTE_PARAMETER3}

Verify Execution Parameters With & Char
    Create Angle From Object List And Save    PD    ${TEST_ANGLE_EXECUTE_PARAMETER4}
    Click Edit Angle
    Click Angle Detail Definition Tab
    Add Filter From Angle Details Popup    Created By    Material__ERNAM
    Choose Dropdown Filter Operator In Definition Tab    is in list
    Input Filter Input Text In List    0    TEST&TEST
    Click Execute Parameter To Filter
    Click Save Angle
    Back To Search
    Search By Text And Expect In Search Result    ${TEST_ANGLE_EXECUTE_PARAMETER4}
    Click Link Item From Search Result Not Execute Popup    ${TEST_ANGLE_EXECUTE_PARAMETER4}
    Click Submit Angle Execution Parameters
    Back To Search And Delete Angle Are Created    ${TEST_ANGLE_EXECUTE_PARAMETER4}
