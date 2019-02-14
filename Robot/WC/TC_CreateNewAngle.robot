*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page

*** Test Cases ***
Verify Create Template From Angle
    [Tags]    smoke    smk_wc
    Create Template From Angle    PD    [ROBOT] Test Create Template from Angle

Verify Create New Angle From Full Object List Test
    [Tags]    smoke     smk_wc
    ${angleName}    Set Variable    [ROBOT] Test Create New Angle From Full Object List
    ${objectName}    Set Variable    PD
    Create Angle From Object List And Save    ${objectName}    ${angleName}
    Back To Search
    Search By Text And Expect In Search Result    ${angleName}
    Click Sort By Created On Search Page
    Click Select First Item From Search Result
    ${angleItemName}    Get Name Of Selected Item From Search Result
    Should Be Equal    ${angleItemName}    ${angleName}
    Click Select First Item From Search Result
    Delete First Search Result Item

Verify Element Create New Angle Option Popup All Object
    [Tags]    acceptance     acc_wc
    Click Create Angle Button
    Page Should Contain     Create Angle for model
    Page Should Contain Element     ${btnButtonCreateAngleFromSchemaSimple}
    Page Should Contain Element     ${imgCreateAngleFromSchemaSimple}

    Page Should Contain Element     ${btnButtonCreateAngleFromSchemaDetailed}
    Page Should Contain Element     ${imgCreateAngleFromSchemaDetailed}

    Page Should Contain Element     ${btnButtonCreateAngleFromObjects}
    Page Should Contain Element     ${imgCreateAngleFromObjects}

Verify Element Create New Angle Basic: Select a Template Angle from the Activity Diagram
    [Tags]    acceptance     acc_wc
    Open Create Angle By Activity Diagram Popup
    Page Should Contain     Activity Diagram
    Page Should Contain Element     ${divActivityDiagramDescriptionSection}
    Page Should Contain Element     ${divActivityDiagramSchemaGridSection}
    Page Should Contain Element     ${divActivityDiagramBusinessProcessBarSection}
    Page Should Contain Element     ${btnActivityDiagramBack}
    Page Should Contain Element     ${btnActivityDiagramCreateAngle}
    Click Back Create Angle Popup Option Activity Diagram Loaded

Verify Element Create New Angle Advanced: Select a Template Angle from the Object Diagram
    [Tags]    intermittent
    Open Create Angle By Object Diagram Popup
    Page Should Contain     Object Diagram
    Page Should Contain Element     ${divObjectDiagramDescriptionSection}
    Page Should Contain Element     ${divObjectDiagramSchemaGridSection}
    Page Should Contain Element     ${divObjectDiagramBusinessProcessBarSection}
    Page Should Contain Element     ${btnObjectDiagramBack}
    Page Should Contain Element     ${btnObjectDiagramCreateAngle}
    Click Back Create Angle Popup Option Object Diagram Loaded

Verify Element Create New Angle Expert: Select an object from the Object List
    [Tags]    acceptance     acc_wc
    Open Create Angle By Object List Popup
    Page Should Contain     Object List
    Page Should Contain Element     ${txtFitlerObjects}
    Page Should Contain Element     ${btnFitlerObjects}
    Page Should Contain Element     ${divObjectListDescriptionSection}
    Page Should Contain Element     ${gridObjectList}
    Page Should Contain Element     ${divObjectListBusinessProcessBarSection}
    Page Should Contain Element     ${btnObjectListBack}
    Page Should Contain Element     ${btnCreateNewAngleByObjectList}
    Click Back Create Angle Popup Option Object List Loaded

Verify Click Select Object Row On Create Angle From Object List
    [Tags]    acceptance     acc_wc
    Open Create Angle By Object List Popup
    Fill In Search Create Angle By Object List Popup    P
    Click First Object from List
    ${objectIsHightLight}    Check Object List Is Hightlight    0
    Should Be True    ${objectIsHightLight}
    ${ObjectIsChecked}    Check Object List Is Checked    0
    Should Be True    ${ObjectIsChecked}
    Click Object Description From List    1
    ${objectIsHightLight}    Check Object List Is Hightlight    1
    Should Be True    ${objectIsHightLight}
    ${ObjectIsChecked}    Check Object List Is Checked    1
    Should Be True    ${ObjectIsChecked}
    Click Object From List    2
    ${objectIsHightLight}    Check Object List Is Hightlight    2
    Should Be True    ${objectIsHightLight}
    ${ObjectIsChecked}    Check Object List Is Checked    2
    Should Be True    ${ObjectIsChecked}
    Sleep    1s
    Unselect Object From List    2
    ${objectIsHightLight}    Check Object List Is Hightlight    2
    Should Not Be True    ${objectIsHightLight}
    ${ObjectIsChecked}    Check Object List Is Checked    2
    Should Not Be True    ${ObjectIsChecked}
    Click Object Description From List    3
    ${objectIsHightLight}    Check Object List Is Hightlight    3
    Should Be True    ${objectIsHightLight}
    ${ObjectIsChecked}    Check Object List Is Checked    3
    Should Be True    ${ObjectIsChecked}
    Sleep    1s
    Click Object Description From List    3
    ${objectIsHightLight}    Check Object List Is Hightlight    3
    Should Not Be True    ${objectIsHightLight}
    ${ObjectIsChecked}    Check Object List Is Checked    3
    Should Not Be True    ${ObjectIsChecked}

Verify Other Tab In Business Process
    [Tags]    acceptance     acc_wc
    Open Create Angle By Object List Popup
    ${numberOfObjectS2D}    Get Number Of Object In Business Process
    Click Select Or Deselect Business Process In Object List    OTHER
    ${numberOfObjectS2DAndOther}    Get Number Of Object In Business Process
    Should Be True    ${numberOfObjectS2D}<=${numberOfObjectS2DAndOther}
    Click Select Or Deselect Business Process In Object List    OTHER
    ${numberOfObjectS2DNoOther}    Get Number Of Object In Business Process
    Should Be True    ${numberOfObjectS2D}==${numberOfObjectS2DNoOther}
    Click Select Or Deselect Business Process In Object List    S2D
    ${numberOfObjectDeselectS2D}    Get Number Of Object In Business Process
    Should Be True    ${numberOfObjectS2DNoOther}==${numberOfObjectDeselectS2D}
