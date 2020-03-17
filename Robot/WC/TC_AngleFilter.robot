*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags        	acc_wc    smk_content

*** Test Cases ***
Verify All Operators For All Field Type
    [Tags]  acc_wc_aci
    Search Angle From Search Page And Execute Angle    Test Angle Filter
    Verify Operators Currency Field     OrderedValue     ordered value  ${TRUE}
    Verify Operators Date Field     CreationDate     Created on     ${FALSE}
    Verify Operators Enumerated Field    PurchaseOrganization__PurchaseOrganization     Purchase Org.   ${TRUE}
    Verify Operators Text Field     OrderNumber    Order Number     ${TRUE}
    Verify Operators Boolean Field    RelevantForLogistics    MRP relevant  ${TRUE}
    Verify Operators Percentage Field     StockAvailabilityPct    Stock Availability %  ${TRUE}    
    Verify Operators DateTime Field     Material___prop_moment    prop_moment   ${FALSE}
    [Teardown]  Run Keyword    Go to Search Page

Add Or Change Filter And Get Correct Result
    [Tags]  acc_wc_aci
    Search Angle From Search Page And Execute Angle    Test Angle Filter
    Add Or Change Currency Filter    OrderedValue     ordered value     ${TRUE}
    [Teardown]  Run Keyword    Go to Search Page

Verify Add Filter Before Jump
    [Tags]  acc_wc_aci
    # prepare stuff
    ${angleName}  Set Variable  [ROBOT] Add filter before jump test
    Upload Item And Check From Search Result  ANGLE_FILTER_BEFORE_JUMP.json    EA2_800    ${angleName}
    Open Angle From First Angle in Search Page    ${angleName}

    # check add filter/jump from Angle popup
    Open Angle Detail Popup
    Click Angle Detail Definition Tab
	
	# M4-71243 the other values should not be change
	${beforeAddJumpText}  Get Filter Text From Popup    0
    
	Add Filter From Angle Details Popup    "delivery block"    DeliveryNoteHeader__DeliveryBlock    ${FALSE}
    Add Filter Before Jump From Angle Details Popup    0    "delivery block"    DeliveryBlock       ${FALSE}
	
	# M4-71243 the other values should not be change
	${afterAddJumpText}  Get Filter Text From Popup    1
    Should Be Equal As Strings    ${beforeAddJumpText}    ${afterAddJumpText}
	
	Click Add Jump In Definition Tab
    Jump Should Be Existed In Popup    Delivery Header
    Jump Should Be Existed In Popup    Material
    Jump Should Be Existed In Popup    Material on Plant Level
    Click Close Add Jump Popup
    Close Angle Detail Popup

    # check add filter/jump from Display popup
    Click Angle Dropdown Actions Edit Display
    Click Display Detail Filter And Jumps Tab
    Add Filter From Display Details Popup    "Material type"    MaterialType    ${FALSE}
    Add Filter Before Jump From Display Details Popup    0    "delivery block"    DeliveryNoteHeader__DeliveryBlock     ${FALSE} 
    Click Add Jump In Display Filter And Jumps Tab
    Jump Should Be Existed In Popup    Material Plant Data
    Click Close Add Jump Popup
    Close Display Detail Popup

    [Teardown]    Back To Search And Delete Angle Are Created    ${angleName}