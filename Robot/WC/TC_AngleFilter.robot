*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags        	acceptance    acc_wc

*** Variables ***
${ANGLE_FILTER_NAME}        Test Angle Filter

*** Test Cases ***
Verify All Operators For All Field Type
    Search By Text And Expect In Search Result    ${ANGLE_FILTER_NAME}
    Open Angle From First Angle in Search Page    ${ANGLE_FILTER_NAME}
    Verify Operators Currency Field     OrderedValue     ordered value
    Verify Operators Date Field     CreationDate     Created on
    Verify Operators Enumerated Field    PurchaseOrganization__PurchaseOrganization     Purchase Org.
    Verify Operators Text Field     OrderNumber    Order Number
    Verify Operators Boolean Field    RelevantForLogistics    MRP relevant
    Verify Operators Percentage Field     StockAvailabilityPct    Stock Availability %
    Verify Operators DateTime Field     Material___prop_moment    prop_moment

Add Or Change Filter And Get Correct Result
    Search By Text And Expect In Search Result    ${ANGLE_FILTER_NAME}
    Open Angle From First Angle in Search Page    ${ANGLE_FILTER_NAME}
    Add Or Change Currency Filter    OrderedValue     ordered value
