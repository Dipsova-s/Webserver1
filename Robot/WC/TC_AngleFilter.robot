*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags        	acceptance    acc_wc

*** Test Cases ***
Verify All Operators For All Field Type
    Search By Text And Expect In Search Result    Test Angle Filter
    Open Angle From First Angle in Search Page    Test Angle Filter
    Verify Operators Currency Field     OrderedValue     ordered value
    Verify Operators Date Field     CreationDate     Created on
    Verify Operators Enumerated Field    PurchaseOrganization__PurchaseOrganization     Purchase Org.
    Verify Operators Text Field     OrderNumber    Order Number
    Verify Operators Boolean Field    RelevantForLogistics    MRP relevant
    Verify Operators Percentage Field     StockAvailabilityPct    Stock Availability %
    Verify Operators DateTime Field     Material___prop_moment    prop_moment
    [Teardown]  Run Keyword    Go to Search Page

Add Or Change Filter And Get Correct Result
    Search By Text And Expect In Search Result    Test Angle Filter
    Open Angle From First Angle in Search Page    Test Angle Filter
    Add Or Change Currency Filter    OrderedValue     ordered value
    [Teardown]  Run Keyword    Go to Search Page

Verify Add Filter Before Jump
    # prepare stuff
    Upload Item And Check From Search Result  ANGLE_FILTER_BEFORE_JUMP.json    EA2_800    Add filter before jump test
    Open Angle From First Angle in Search Page    Add filter before jump test

    # check add filter/jump from Angle popup
    Open Angle Detail Popup
    Click Angle Detail Definition Tab
    Add Filter From Angle Details Popup    "delivery block"    DeliveryNoteHeader__DeliveryBlock
    Add Filter Before Jump From Angle Details Popup    0    "delivery block"    DeliveryBlock
    Click Add Jump In Definition Tab
    Jump Should Be Existed In Popup    Delivery Header
    Jump Should Be Existed In Popup    Material
    Jump Should Be Existed In Popup    Material on Plant Level
    Click Close Add Jump Popup
    Close Angle Detail Popup

    # check add filter/jump from Display popup
    Click Angle Dropdown Actions Edit Display
    Click Display Detail Filter And Jumps Tab
    Add Filter From Display Details Popup    "Material type"    MaterialType
    Add Filter Before Jump From Display Details Popup    0    "delivery block"    DeliveryNoteHeader__DeliveryBlock
    Click Add Jump In Display Filter And Jumps Tab
    Jump Should Be Existed In Popup    Material Plant Data
    Click Close Add Jump Popup
    Close Display Detail Popup

    [Teardown]    Back To Search And Delete Angle Are Created    Add filter before jump test