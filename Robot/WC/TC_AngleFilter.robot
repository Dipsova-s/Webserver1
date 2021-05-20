*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Force Tags        	acc_wc    smk_content

*** Test Cases ***
Verify All Operators For All Field Type
    [Documentation]     Verify all operators for all field type on angle filter are return the correct result type
    ...                 Risk/coverage area: The filter on the angle side panel
    [Tags]      TC_C196803  acc_wc_aci
    ${angleName}  Set Variable  [ROBOT] Test Verify All Operators For All Field Type
    ${objectName}     Set Variable   PD Schedule Line
    ${bps}    Create List    S2D
    Create Blank Adhoc Angle From One Object    ${objectName}   ${angleName}   ${bps} 
    Verify Operators Currency Field     OrderedValue     ordered value  ${TRUE}
    Verify Operators Date Field     CreationDate     Created on     ${TRUE}
    Verify Operators Enumerated Field    PurchaseOrganization__PurchaseOrganization     Purchase Org   ${FALSE}
    Verify Operators Text Field     OrderNumber    Order Number     ${TRUE}
    Verify Operators Boolean Field    RelevantForLogistics    MRP relevant  ${TRUE}
    Verify Operators Percentage Field     StockAvailabilityPct    Stock Availability %  ${TRUE}    
    Verify Operators DateTime Field     Material___prop_moment    prop_moment   ${FALSE}
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Add Or Change Filter And Get Correct Result
    [Documentation]     Verify step add or change the filter on display filter should get the correct result
    ...                 Risk/coverage area: The filter on the display side panel
    [Tags]      TC_C196803  acc_wc_aci
    ${angleName}  Set Variable   [ROBOT] Test Add Or Change Filter
    ${objectName}     Set Variable   PD Schedule Line
    ${bps}    Create List    S2D
    Create Blank Adhoc Angle From One Object    ${objectName}   ${angleName}   ${bps}
    Add Or Change Filter    OrderedValue     ordered value    has_value     ${TRUE}
    Assert Display Filter Should Contain    0    (Self) - Ordered Value is not empty
    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}

Verify Add Filter Before Jump
    [Tags]  acc_wc_aci
    # prepare stuff
    ${angleName}  Set Variable  [ROBOT] Add filter before jump test
    Upload Item And Check From Search Result  ANGLE_FILTER_BEFORE_JUMP.json    EA2_800    ${angleName}
    Open Angle From First Angle in Search Page    ${angleName}
    Set Editor Context: Display Tab

    # check add filter/jump from Angle popup
    Click Angle Tab
    Add Filter On Angle    "delivery block"    DeliveryNoteHeader__DeliveryBlock    ${FALSE}
    Add Filter Before Jump On Angle    0    "delivery block"    DeliveryBlock       ${FALSE}

    Click Add Jump On Angle
    Jump Should Be Existed In Popup    Delivery Header
    Jump Should Be Existed In Popup    Material
    Jump Should Be Existed In Popup    Material on Plant Level
    Click Close Add Jump Popup
    Click Cancel button Angle Filters And Jumps

    # check add filter/jump from Display popup
    Click Display Tab
    Set Editor Context: Display Tab
    Add Filter    "Material type"    MaterialType    ${FALSE}
    Add Filter Before Jump On Display    0    "delivery block"    DeliveryNoteHeader__DeliveryBlock    ${FALSE}

    Click Add Jump On Display
    Jump Should Be Existed In Popup    Material Plant Data
    Click Close Add Jump Popup
    Click Cancel button Display Filters And Jumps

    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}