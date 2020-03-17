*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Variables ***
${TEST_ANGLE_EXECUTE_PARAMETER}      [ROBOT] Verify Execution Parameters When Argument Contains Space
${TEST_ANGLE_EXECUTE_PARAMETER2}     [ROBOT] Verify Execution Parameters When Argument Is Empty
${TEST_ANGLE_EXECUTE_PARAMETER3}     [ROBOT] Verify Execution Parameters With Compare Field
${TEST_ANGLE_EXECUTE_PARAMETER4}     [ROBOT] Verify Execution Parameters With & Char
${TEST_ANGLE_EXECUTE_PARAMETER5}     [ROBOT] Angle with invalid argument values


*** Test Cases ***
Verify Execution Parameters When Argument Contains Space Test
    Create Angle From Object List And Save    PD    ${TEST_ANGLE_EXECUTE_PARAMETER}
    Verify Filter With Execute Parameter To List Display    text    is equal to    Vendor__NameAndDescription    Description
    ${numberOfObject}    Get Number Of Object
    Click Angle Dropdown Actions Save Existing Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${TEST_ANGLE_EXECUTE_PARAMETER}
    Wait Angle Page Document Loaded
    ${numberOfObjectAfterExecuteParameter}    Get Number Of Object
    Should Be True    ${numberOfObject}==${numberOfObjectAfterExecuteParameter}
    Back To Search And Delete Angle Are Created    ${TEST_ANGLE_EXECUTE_PARAMETER}

Verify Execution Parameters When Argument Is Empty
    Create Angle From Object List And Save    PD    ${TEST_ANGLE_EXECUTE_PARAMETER2}
    Click Edit Angle
    Click Angle Detail Definition Tab
    Add Filter From Angle Details Popup    Execution    ExecutionStatus     ${FALSE}
    Choose Dropdown Filter Operator In Definition Tab    is in list
    Click Execute Parameter To Filter
    Click Save Angle
    Go to Search Page
    Search By Text And Expect In Search Result    ${TEST_ANGLE_EXECUTE_PARAMETER2}
    Execute First Search Item In Edit Mode
    Back To Search And Delete Angle Are Created    ${TEST_ANGLE_EXECUTE_PARAMETER2}

Verify Execution Parameters With Compare Field Test
    [Documentation]     Verify execute an angle with Compare Field in Execution Parameters can add the compare filters
    ...                 Risk/coverage area: create an adhoc angle and then execute it on search page
    [Tags]              TC_C228800  acc_wc_aci
    Create Adhoc Angle From Object List    PD    ${TEST_ANGLE_EXECUTE_PARAMETER3}
    Click Angle Detail Definition Tab
    Add Filter From Angle Details Popup    Material    MaterialValue    ${TRUE}
    Choose Dropdown Filter Operator In Definition Tab    is equal to
    Click Select Field Button In Definition Tab
    Add Field By Search From Field Chooser    Invoiced    InvoicedValue     ${TRUE}
    Click Execute Parameter To Filter
    Click Save Angle
    Go to Search Page
    Search By Text And Expect In Search Result    ${TEST_ANGLE_EXECUTE_PARAMETER3}
    Click Link Item From Search Result Not Execute Popup    ${TEST_ANGLE_EXECUTE_PARAMETER3}
    Wait Until Angle Execute Parameters Popup Loaded
    Add Compare Filter From Angle Details Popup    Item     PurchaseOrderLine__ItemValue    ${FALSE}
    Click Submit Angle Execution Parameters
    Back To Search And Delete Angle Are Created    ${TEST_ANGLE_EXECUTE_PARAMETER3}

Verify Execution Parameters With & Char
    Create Angle From Object List And Save    PD    ${TEST_ANGLE_EXECUTE_PARAMETER4}
    Click Edit Angle
    Click Angle Detail Definition Tab
    Add Filter From Angle Details Popup    "Created By"    EKKO_ERNAM    ${TRUE}
    Choose Dropdown Filter Operator In Definition Tab    is in list
    Input Filter Input Text In List    0    TEST&TEST
    Click Execute Parameter To Filter
    Click Save Angle
    Go to Search Page
    Search By Text And Expect In Search Result    ${TEST_ANGLE_EXECUTE_PARAMETER4}
    Click Link Item From Search Result Not Execute Popup    ${TEST_ANGLE_EXECUTE_PARAMETER4}
    Click Submit Angle Execution Parameters
    Back To Search And Delete Angle Are Created    ${TEST_ANGLE_EXECUTE_PARAMETER4}

Verify Invalid Argument values
    [Tags]  acc_wc_aci
    Upload Item And Check From Search Result  angle_with_invalid_argument_values.angle.json    EA2_800    ${TEST_ANGLE_EXECUTE_PARAMETER5}
    Click Link Item From Search Result Not Execute Popup    ${TEST_ANGLE_EXECUTE_PARAMETER5}
    Wait Until Angle Execute Parameters Popup Loaded
    Click Submit Angle Execution Parameters
    [Teardown]    Back To Search And Delete Angle Are Created    ${TEST_ANGLE_EXECUTE_PARAMETER5}

