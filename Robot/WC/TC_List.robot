*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Variables ***
${TEST_VERIFY_QUICK_FILTER_OPTIONS}         [ROBOT] Test Verify Quick Filter Options
${TEST_RE_ADD_FIELD_TO_DISPLAY_LIST}        [ROBOT] Verify Re Add Field To Display List
${TEST_GOTO_SAP_OPTION}                     [ROBOT] Test Goto SAP Option

*** Test Cases ***
Verify Create List Display From Pivot And Delete It Test
    Create List Display From Pivot And Delete It    List From Pivot

Verify Quick Filter Options
    Quick Filter Options For Number    Angle For General Test    OrderedValue

Verify Add A Duplicate Field To Display List Test
    ${firstFieldId}         Set Variable       ServiceLevel
    ${firstFieldKeyword}    Set Variable       Service Level
    ${secondFieldId}        Set Variable       ExecutionStatus
    ${secondFieldKeyword}   Set Variable       Execution

    Create Angle From Object List And Save    PD    ${TEST_RE_ADD_FIELD_TO_DISPLAY_LIST}
    Add Column By Search And Add To List Display If Not Exist    ${firstFieldId}    ${firstFieldKeyword}    ${TRUE}
    Click Header by Data Field Angle Grid List Display    ${firstFieldId}
    Click Sort Descending From Head Column to List
    ${expect}    Get Cell Value From List Display    ${firstFieldId}    set
    Add Column By Search And Add To List Display    ${secondFieldKeyword}     ${secondFieldId}      ${TRUE}
    Add Column By Search And Add To List Display    ${firstFieldKeyword}      ${firstFieldId}       ${TRUE}
    ${result}    Get Cell Value From List Display    ${firstFieldId}    set
    Should Be Equal    ${expect}    ${result}
    Element Should Contain    ${headerLastColumn}    Service Level
    [Teardown]    Back To Search And Delete Angle Are Created    ${TEST_RE_ADD_FIELD_TO_DISPLAY_LIST}

Verify Goto SAP Option
    Create Angle From All Object List And Save    PD    ${TEST_GOTO_SAP_OPTION}
    @{rowNumbers}    Create List    2    4
    @{fields}    Create List    ObjectType    ID    Vendor__Vendor    Vendor__Description    PurchasingDocumentCategory    CompanyCode__CompanyCode    PurchaseOrganization__PurchaseOrganization    ExecutionStatus    CreationDate    DeliveryStatus    OrderedValue    BKGRP
    Check Goto SAP Transaction With Multiple Rows    ${fields}    ${rowNumbers}
    [Teardown]    Back To Search And Delete Angle Are Created    ${TEST_GOTO_SAP_OPTION}

Verify Breadcrumb On Single Item Drilldown
    Search Angle From Search Page And Execute Angle    Angle For General Test
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    Click Drilldown To Item By Name    IDES Consumer Products
    Page Should Contain Drilldown Label
