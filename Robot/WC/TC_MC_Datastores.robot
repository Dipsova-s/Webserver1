*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To Datastores Page With Admin User
Suite Teardown      Close Browser
Test Teardown       Go To Datastores Page
Force Tags          acc_mc

*** Variables ***
${pluginCSV}        Export Angle to CSV
${pluginExcel}     Export Angle to Microsoft Excel
${pluginSQL}        Export Angle to Microsoft SQL Server

${pluginCSVName}         _AutoCSV
${pluginExcelName}       _AutoExcel
${pluginSQLName}         _AutoSQL

${pluginCSVEditedName}        _EditedCSV
${pluginExcelEditedName}      _EditedExcel
${pluginSQLEditedName}        _EditedSQL

*** Test Cases ***
Verify Default Datastores
     [Documentation]     This test case deals with verifying default datastores for Excel & CSV created as part of AppServer set up
     ...                 and their respective default settings
     [Tags]      TC_C229330   TC_C230142
     Count of Default Datastores Is Always Two
     Default Checkbox For Default Datastores Should Be Selected       Export to CSV - Default
     Default Checkbox For Default Datastores Should Be Selected       Export to Excel Default     
     Sorting Default Datastores
     Default Values are displayed in Default Excel Datastore    Export to Excel Default
     Default Values are displayed in Default CSV Datastore      Export to CSV - Default

Verify CSV Datastore
     [Documentation]     Verify the user is able to edit the CSV datastore and the value is updated post saving the changes
     [Tags]    TC_C39019  acc_mc_aci
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginCSV}
     Create a New CSV DataStores        ${pluginCSV}   ${pluginCSVName}
     ${randomString}     Generate Random String   8    [LETTERS]
     ${pluginCSVEditedName}   catenate  ${randomString}     ${pluginCSVEditedName}
     Edit the Existing CSV Datastore by name     ${pluginCSVName}      ${pluginCSVEditedName}     ${pluginCSV}
     Verify the edited value is displayed in CSV Datastore       ${pluginCSVEditedName}
     Click on Save button in DataStore   ${pluginCSV}      ${pluginCSVEditedName}
     Verify the Datastore is deleted successfully      ${pluginCSV}   ${pluginCSVEditedName}

Verify Excel Datastore
     [Documentation]     Verify the user is able to edit the Excel datastore and the value is updated post saving the changes
     ...                 and verify the excel template list in datstore.
     [Tags]    TC_C39019   acc_mc_aci
     Go To ExcelTemplates Page
     ${excelTemplateCount}     Excel Templates Count
     ${excelTemplatesList}     Get List Excel Templates
     Go To Datastores Page
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginExcel}
     Create a New Excel DataStores        ${pluginExcel}   ${pluginExcelName}
     ${randomString}     Generate Random String   8    [LETTERS]
     ${pluginExcelEditedName}   catenate  ${randomString}     ${pluginExcelEditedName}
     Edit the Existing Excel Datastore by name     ${pluginExcelName}      ${pluginExcelEditedName}     ${pluginExcel}
     Verify the edited value is displayed in Excel Datastore       ${pluginExcelEditedName}
     Verify Excel Template List In Excel Template Dropdown In Excel Datastore    ${excelTemplatesList}
     Click on Save button in DataStore   ${pluginExcel}      ${pluginExcelEditedName}
     Verify the Datastore is deleted successfully      ${pluginExcel}   ${pluginExcelEditedName}

Verify SQL Datastore
     [Documentation]     Verify the user is able to edit the SQL datastore and the value is updated post saving the changes
     [Tags]    TC_C39019  acc_mc_aci
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginSQL}
     Create a New SQL DataStores        ${pluginSQL}   ${pluginSQLName}
     ${randomString}     Generate Random String   8    [LETTERS]
     ${pluginSQLEditedName}   catenate  ${randomString}     ${pluginSQLEditedName}
     Edit the Existing SQL Datastore by name     ${pluginSQLName}      ${pluginSQLEditedName}     ${pluginSQL}
     Verify the edited value is displayed in SQL Datastore       ${pluginSQLEditedName}
     Click on Save button in DataStore   ${pluginSQL}      ${pluginSQLEditedName}
     Verify the Datastore is deleted successfully      ${pluginSQL}   ${pluginSQLEditedName}