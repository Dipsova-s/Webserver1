*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Resource            ${EXECDIR}/WC/POM/Shared/FilterEditor.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify Execution Parameters Behavior
    ${angleName}  Set Variable  [ROBOT] Verify Execution Parameters Behavior
    Upload Item And Check From Search Result  ANGLE_ExecutionParametersBehavior.angle.json    EA2_800    ${angleName}
    Click Link Item From Search Result Not Execute Popup    ${angleName}
    Wait Until Angle Execute Parameters Popup Loaded
    Input Filter Input Text In List  0  2
    Switch To Display Parameters
    Input Filter Input Text In List  0  31
    Click Submit Angle Execution Parameters

    Click Angle Tab
    Angle Execution Parameter Icon Should Be Marked As Executed  0
    Angle Execution Parameter Icon Should Not Be Marked As Executed  1

    Click Display Tab
    Angle Readonly Execution Parameter Icon Should Be Marked As Executed  0
    Angle Readonly Execution Parameter Icon Should Not Be Marked As Executed  1
    Display Execution Parameter Icon Should Be Marked As Executed  0
    Display Execution Parameter Icon Should Not Be Marked As Executed  1

    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Execution Parameters When Argument Contains Space Test
    [Documentation]     Verify execute an angle when argument contains space in execution parameters
    ...                 Risk/coverage area: Create an adhoc angle and then execute it on search page
    [Tags]      TC_C196803
    ${angleName}  Set Variable  [ROBOT] Verify Execution Parameters When Argument Contains Space
    Create Angle From Object List And Save    PD    ${angleName}
    Verify Filter With Execute Parameter To List Display    text    is equal to    FieldDescription    Field Description
    ${numberOfObject}    Get Number Of Object
    Click Save Display
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${angleName}
    ${numberOfObjectAfterExecuteParameter}    Get Number Of Object
    Should Be True    ${numberOfObject}==${numberOfObjectAfterExecuteParameter}

    [Teardown]  Back To Search And Delete Angle Are Created    ${angleName}

Verify Execution Parameters When Argument Is Empty
    ${angleName}  Set Variable  [ROBOT] Verify Execution Parameters When Argument Is Empty
    Create Angle From Object List And Save    PD    ${angleName}
    Click Angle Tab
    Set Editor Context: Angle Tab
    Add Filter On Angle    Execution    ExecutionStatus     ${FALSE}
    Set Editor Index    0  
    Choose Dropdown Filter Operator Via Edit Filter    is in list
    Click Execute Parameter On Angle
    Click Apply Filter On Angle
    Go to Search Page
    Search By Text And Expect In Search Result    ${angleName}
    Execute First Search Item In Edit Mode

    [Teardown]   Back To Search And Delete Angle Are Created    ${angleName}

Verify Execution Parameters With Compare Field Test
    [Documentation]     Verify execute an angle with Compare Field in Execution Parameters can add the compare filters
    ...                 Risk/coverage area: create an adhoc angle and then execute it on search page
    [Tags]              TC_C228800  acc_wc_aci
    ${angleName}  Set Variable  [ROBOT] Verify Execution Parameters With Compare Field
    Create Angle From Object List And Save    PD    ${angleName}
    Click Angle Tab
    Set Editor Context: Angle Tab
    Add Filter On Angle    Material    MaterialValue    ${TRUE}
    Set Editor Index    0  
    Choose Dropdown Filter Operator Via Edit Filter    is equal to    
    Click Select Field On Angle
    Add Field By Search From Field Chooser    Invoiced    InvoicedValue    ${TRUE}
    Click Execute Parameter On Angle
    Click Apply Filter On Angle
    Go to Search Page
    Search By Text And Expect In Search Result    ${angleName}
    Click Link Item From Search Result Not Execute Popup    ${angleName}
    Wait Until Angle Execute Parameters Popup Loaded
    Add Compare Filter From Angle Execution Parameters Popup    Margin     Margin    ${TRUE}
    Click Submit Angle Execution Parameters
    
    [Teardown]   Back To Search And Delete Angle Are Created    ${angleName}

Verify Execution Parameters With & Char
    ${angleName}  Set Variable  [ROBOT] Verify Execution Parameters With & Char
    Create Angle From Object List And Save    PD    ${angleName}
    Click Angle Tab
    Set Editor Context: Angle Tab
    Add Filter On Angle    "Created By"    EKKO_ERNAM    ${TRUE}
    Set Editor Index    0  
    Choose Dropdown Filter Operator Via Edit Filter    is in list
    Input Filter Input Text In List    0    TEST&TEST
    Click Execute Parameter On Angle
    Click Apply Filter On Angle
    Go to Search Page
    Search By Text And Expect In Search Result    ${angleName}
    Click Link Item From Search Result Not Execute Popup    ${angleName}
    Click Submit Angle Execution Parameters
    
    [Teardown]   Back To Search And Delete Angle Are Created    ${angleName}

Verify Invalid Argument values
    [Tags]  acc_wc_aci
    ${angleName}  Set Variable  [ROBOT] Angle with invalid argument values
    Upload Item And Check From Search Result  angle_with_invalid_argument_values.angle.json    EA2_800    ${angleName}
    Click Link Item From Search Result Not Execute Popup    ${angleName}
    Wait Until Angle Execute Parameters Popup Loaded
    Click Submit Angle Execution Parameters

    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Execution Parameters With Invalid Display Filter
    [Documentation]     Execute an angle with display filter should open the angle page without asking for execution parameter
    ...                 Risk/coverage area: Search page open an Angle with invalid display filter
    [Tags]      TC_C228900
    [Setup]     Import Angle By API  /models/1  ANGLE_WithExecutionParametersAndInvalidDisplayFilter.json  user=${Username}
    ${angleName}  Set Variable  [ROBOT] ANGLE_WITH_EXECUTION_PARAMETERS_AND_INVALID_DISPLAY_FILTER
    Search By Text And Expect In Search Result    ${angleName}
    Click Link Item From Search Result Not Execute Popup    ${angleName}
    Wait Angle Page Document Loaded
    [Teardown]  Clean Up Items And Go To Search Page