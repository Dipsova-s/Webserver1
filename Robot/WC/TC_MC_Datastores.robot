*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To Datastores Page With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go To Datastores Page
Force Tags          acc_mc

*** Variables ***
${pluginCSV}        Export Angle to CSV
${pluginExcel}     Export Angle to Microsoft Excel
${pluginSQL}        Export Angle to Microsoft SQL Server

${pluginCSVName}         automation_CSV_DataStore
${pluginExcelName}       automation_ExcelDataStore
${pluginSQLName}         automation_SQLDataStore

${pluginCSVEditedName}         auto_Edit_CSV_DataStore
${pluginExcelEditedName}       auto_Edit_Excel_DataStore
${pluginSQLEditedName}         auto_Edit_SQL_DataStore

*** Test Cases ***
Create a New CSV DataStores and Verify the Datastore created successfully with the given values
     [Documentation]     Verify the user is able to create CSV datastore with given values and the CSV datastore is displayed in datastore grid.
     [Tags]    TC-C39019
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginCSV}
     Create a New CSV DataStores        ${pluginCSV}   ${pluginCSVName}

Create a New Excel DataStores and Verify the Datastore created successfully with the given values
     [Documentation]     Verify the user is able to create Excel datastore with given values and the CSV datastore is displayed in datastore grid. 
     [Tags]    TC-C39019
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginExcel}
     Create a New Excel DataStores      ${pluginExcel}   ${pluginExcelName}

Create a New SQL DataStores and Verify the Datastore created successfully with the given values
     [Documentation]     Verify the user is able to create SQL datastore with given values and the CSV datastore is displayed in datastore grid. 
     [Tags]    TC-C39019
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginSQL}
     Create a New SQL DataStores      ${pluginSQL}   ${pluginSQLName}

Verify the Datastores grid is filtered correctly
     [Documentation]     Verify the user is able to search and filter the datastores in datastores grid table.
     [Tags]    TC-C39019
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginCSV}
     Create a New CSV DataStores        ${pluginCSV}   ${pluginCSVName}
     Verify the Datastore Filtered with Text  automation

Verify the edited CSV Datastores updated successfully with the given values
     [Documentation]     Verify the user is able to edit the CSV datastore and the value is updated post saving the changes
     [Tags]    TC-C39019
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginCSV}
     Create a New CSV DataStores        ${pluginCSV}   ${pluginCSVName}
     Verify the Datastore Filtered with Text      ${pluginCSVName}
     Edit the Existing CSV Datastore by name     ${pluginCSVName}      ${pluginCSVEditedName}     ${pluginCSV}
     Verify the Datastore Filtered with Text      ${pluginCSVEditedName}
     Verify the edited value is displayed in CSV Datastore       ${pluginCSVEditedName}
     Click on Save button in DataStore   ${pluginCSV}      ${pluginCSVEditedName}
     Verify the Datastore is deleted successfully      ${pluginCSV}   ${pluginCSVEditedName}

Verify the edited Excel Datastores updated successfully with the given values
     [Documentation]     Verify the user is able to edit the Excel datastore and the value is updated post saving the changes
     [Tags]    TC-C39019
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginExcel}
     Create a New Excel DataStores        ${pluginExcel}   ${pluginExcelName}
     Verify the Datastore Filtered with Text      ${pluginExcelName}
     Edit the Existing Excel Datastore by name     ${pluginExcelName}      ${pluginExcelEditedName}     ${pluginExcel}
     Verify the Datastore Filtered with Text      ${pluginExcelEditedName}
     Verify the edited value is displayed in Excel Datastore       ${pluginExcelEditedName}
     Click on Save button in DataStore   ${pluginExcel}      ${pluginExcelEditedName}
     Verify the Datastore is deleted successfully      ${pluginExcel}   ${pluginExcelEditedName}

Verify the edited SQL Datastores updated successfully with the given values
     [Documentation]     Verify the user is able to edit the SQL datastore and the value is updated post saving the changes
     [Tags]    TC-C39019
     Click Add Data Stores
     Select Datastore Plugins option in popup    ${pluginSQL}
     Create a New SQL DataStores        ${pluginSQL}   ${pluginSQLName}
     Verify the Datastore Filtered with Text      ${pluginSQLName}
     Edit the Existing SQL Datastore by name     ${pluginSQLName}      ${pluginSQLEditedName}     ${pluginSQL}
     Verify the Datastore Filtered with Text      ${pluginSQLEditedName}
     Verify the edited value is displayed in SQL Datastore       ${pluginSQLEditedName}
     Click on Save button in DataStore   ${pluginSQL}      ${pluginSQLEditedName}
     Verify the Datastore is deleted successfully      ${pluginSQL}   ${pluginSQLEditedName}