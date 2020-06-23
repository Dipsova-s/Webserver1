*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/SuggestedFields.robot

*** Keywords ***
Go To Suggested Fields Page
    Wait Side Menu Ready
    Click Side Menu Models
    Click Side Menu Models EA2_800
    Click Side Menu Suggested Fields
    Wait Until Suggested Fields Page Loaded

Go To Suggested Fields Page With Admin User
    Go to MC Then Login With Admin User
    Go To Suggested Fields Page

Reload Suggested Fields Page
    Click Side Menu Suggested Fields
    Wait Until Suggested Fields Page Loaded

Set Suggested Fields For Single Object
    [Arguments]    ${ObjectName}    ${BusinessProcess}
    Click Set Fields Button For Single Object
    Wait Popup Set Suggested Fields Object Loaded
    Fill In Search Object    ${ObjectName}
    Select Business Process On Suggested Popup    ${BusinessProcess}
    Click First Object from List
    Click Continue
    Click Facet Source Object
    Select Filter (Self)
    Click Select All Items
    Compare Amount Of Items
    Click Set Fields Button For Single Object
    Click First Object from List
    Click Continue
    Click Facet Fields Type
    Select Filter Currency
    Click Select All Items
    Click Save Suggested Field
    Click Save Confirm Suggestion Field
    Verify "undefined" Word On SuggestedFields Report
    Click Close Suggested Field Report

Verify Suggested Fields After Set
    [Arguments]    ${ObjectName}    ${BusinessProcess}
    Click Set Fields Button For Single Object
    Wait Popup Set Suggested Fields Object Loaded
    Fill In Search Object    ${ObjectName}
    Select Business Process On Suggested Popup    ${BusinessProcess}
    Click First Object from List
    Click Continue
    Select Filter Suggested
    Wait Until Element Is Visible    ${FieldMargin}
    Wait Until Element Is Visible    ${FieldMarginValue}

Click Clear All Suggested Fields
    Click Clear All Button
    Click Save Suggested Field
    Click Save Confirm Suggestion Field
    Click Close Suggested Field Report

Set Suggested Fields For Basic List
    [Arguments]    ${ObjectName}    ${BusinessProcess}
    Click Set Fields Button For Basic List
    Wait Popup Set Suggested Fields Object Loaded
    Fill In Search Object    ${ObjectName}
    Select Business Process On Suggested Popup    ${BusinessProcess}
    Click First Object from List
    Click Continue
    Click Save Confirm Suggestion Field
    Click Close Suggested Field Report

Verify Suggested Fields After Set Basic List
    [Arguments]    ${ObjectName}    ${BusinessProcess}
    Click Set Fields Button For Basic List
    Wait Popup Set Suggested Fields Object Loaded
    Fill In Search Object    ${ObjectName}
    Select Business Process On Suggested Popup    ${BusinessProcess}
    Click First Object from List
    Click Continue
    Select Filter Suggested
    Page Should Contain Element    ${FieldCompanyCode}
    Page Should Contain Element    ${FieldID}
    Page Should Contain Element    ${FieldVendor}
    Sleep    1s

Set Suggested Fields For Default Template
    [Arguments]    ${ObjectName}    ${BusinessProcess}
    Click Set Fields Button For Default Template
    Wait Popup Set Suggested Fields Object Loaded
    Fill In Search Object    ${ObjectName}
    Select Business Process On Suggested Popup    ${BusinessProcess}
    Click Second Object from List
    Click Continue
    Click Save Confirm Suggestion Field
    Click Close Suggested Field Report

Set Suggested Fields For All Template
    [Arguments]    ${ObjectName}    ${BusinessProcess}
    Click Set Fields Button For All Template
    Wait Popup Set Suggested Fields Object Loaded
    Fill In Search Object    ${ObjectName}
    Select Business Process On Suggested Popup    ${BusinessProcess}
    Click First Object from List
    Click Continue
    Click Save Confirm Suggestion Field
    Click Close Suggested Field Report

Set Suggested Fields For Clear All Suggestion
    [Arguments]    ${ObjectName}    ${BusinessProcess}
    Click Clear Fields Button For Clear All Suggestion
    Wait Popup Set Suggested Fields Object Loaded
    Fill In Search Object    ${ObjectName}
    Select Business Process On Suggested Popup    ${BusinessProcess}
    Click First Object from List
    Click Second Object from List
    Click Continue
    Click Save Confirm Suggestion Field
    Click Close Suggested Field Report
   
Clear all suggested fields for all objects    
    Click Clear Fields Button For Clear All Suggestion
    Select All Business Process On Suggested Popup
    Click button Select All
    Click Continue
    Maximize popup window 
    Click Button Save for clearing Suggestion Field
    Click Close on Suggested Field Report

Precondition-Clear all suggested fields for all objects
    ${NumofSuggestedFieldsInTheModel}=  Get Total number of suggested fields in the model
    ${NumofobjectsHavingSuggestedFields}=  Get Number of objects that have suggested fields
    Run Keyword if   ${NumofSuggestedFieldsInTheModel}>0 or ${NumofobjectsHavingSuggestedFields}>0    Clear all suggested fields for all objects