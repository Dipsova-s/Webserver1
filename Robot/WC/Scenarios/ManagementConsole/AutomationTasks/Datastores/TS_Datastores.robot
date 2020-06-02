*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/DataStores/EditDataStores.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/AutomationTasks/DataStores/AllDataStores.robot

*** Keywords ***
Create a New CSV DataStores
    [Arguments]     ${datastorePlugin}      ${datastoreName}        ${setAsDefault}
    Fill Create New Datastore   ${datastoreName}       ${setAsDefault}
    Fill Connection Settings  outputfolderpath
    Fill Data Settings for CSV Export  5  No header  Display  6  {anglename:}  check
    Fill DataStore Format Options    ,  2  HH:mm:ss  ::  M/d/yyyy   /  false  true  None  uncheck  ::  CR  ;
    Click on Save button in DataStore   ${datastorePlugin}      ${datastoreName}

Go To Datastores Page With Admin User
    Go to MC Then Login With Admin User
    Go To Datastores Page

Go To Datastores Page
    Go To MC Page    /Automation%20tasks/Datastores/
    Wait Datastores Page Ready

Create a New Excel DataStores
    [Arguments]     ${datastorePlugin}      ${datastoreName}
    Fill Create New Datastore   ${datastoreName}    none
    Fill Connection Settings  outputfolderpath
    Fill Data Settings for Excel Export  5  Short name  Display  6  {anglename:}     EveryAngle-Orange.xlsx  {displayname:}  check
    Fill Angle Settings  check  check
    Click on Save button in DataStore   ${datastorePlugin}      ${datastoreName}

Create a New SQL DataStores
    [Arguments]     ${datastorePlugin}      ${datastoreName}
    Fill Create New Datastore   ${datastoreName}    none
    Fill Connection Settings for SQL Export  nl-bangalore1\SQLEXPRESS  sa  ea  2019sp2  check
    Fill Data Settings for SQL Export  5  Short name  Display  6  {anglename:}  100  check
    Click on Save button in DataStore   ${datastorePlugin}      ${datastoreName}

Verify the Datastore Filtered with Text
    [Arguments]     ${filterText}
    Enter Text in Datastore filter page  ${filterText}
    Verify the DataStoresGrid is filtered with Text  ${filterText}

Edit the Existing CSV Datastore by name
    [Arguments]     ${name}     ${editedDatastoreName}      ${datastorePlugin}      ${setAsDefault}
    Click on Edit in action drop down by Datastore name     ${name}
    Fill Create New Datastore   ${editedDatastoreName}      ${setAsDefault}
    Fill Connection Settings  outputfolderpathedit
    Fill Data Settings for CSV Export  6  Id  Id  7  {anglename:edited}  uncheck
    Fill DataStore Format Options    .  3  HH:mm:ss  :  d/M/yyyy   ,  true  false  All  check  :  CRLF  ,
    Click on Save button in DataStore   ${datastorePlugin}      ${editedDatastoreName}

Verify the edited value is displayed in CSV Datastore
    [Arguments]     ${editedDatastoreName}
    Click on Edit in action drop down by Datastore name     ${editedDatastoreName}
    Verify the field values for Datastore Name  ${editedDatastoreName}     uncheck
    Verify the field values for CSV and Excel Datastore in Connection Settings    outputfolderpathedit
    Verify the field values for CSV Datastore in Data Settings  6  id  id  7  {anglename:edited}  uncheck
    Verify the field values for CSV Datastore in Format Settings    .  3  HH:mm:ss  :  d/M/yyyy   ,  true  false  all  check  :  CRLF  ,

Verify the Datastore is deleted successfully
    [Arguments]     ${datastorePlugin}      ${datastoreName}
    Click on Delete in action drop down by Datastore name and Delete Datastore      ${datastoreName}
    Wait Until Element Is Visible       ${dataGridDataStoresGrid}
    Verify the datastore is not available in Datastore Grid     ${datastorePlugin}      ${datastoreName}

Edit the Existing Excel Datastore by name
    [Arguments]     ${name}     ${editedDatastoreName}      ${datastorePlugin}
    Click on Edit in action drop down by Datastore name     ${name}
    Fill Create New Datastore   ${editedDatastoreName}    none
    Fill Connection Settings  outputfolderpathedit
    Fill Data Settings for Excel Export  6  Id  Id  7  {anglename:edited}     EveryAngle-Standard.xlsx  {displayname:edited}  uncheck
    Fill Angle Settings  uncheck  uncheck
    Click on Save button in DataStore   ${datastorePlugin}      ${editedDatastoreName}

Verify the edited value is displayed in Excel Datastore
    [Arguments]     ${editedDatastoreName}
    Click on Edit in action drop down by Datastore name     ${editedDatastoreName}
    Verify the field values for Datastore Name  ${editedDatastoreName}     none
    Verify the field values for CSV and Excel Datastore in Connection Settings    outputfolderpathedit
    Verify the field values for Excel Datastore in Data Settings    6  id  id  7  {anglename:edited}     EveryAngle-Standard.xlsx  {displayname:edited}  uncheck
    Verify the field values for Excel Datastore in Angle Settings   uncheck  uncheck

Edit the Existing SQL Datastore by name
    [Arguments]     ${name}     ${editedDatastoreName}      ${datastorePlugin}
    Click on Edit in action drop down by Datastore name     ${name}
    Fill Create New Datastore   ${editedDatastoreName}    none
    Fill Connection Settings for SQL Export  nl-bangalore1\SQLEXPRESS  sa  ea  2019sp2  check
    Fill Data Settings for SQL Export  6  Long name  Id  5  {anglename:edited}  99  uncheck
    Click on Save button in DataStore   ${datastorePlugin}      ${editedDatastoreName}

Verify the edited value is displayed in SQL Datastore
    [Arguments]     ${editedDatastoreName}
    Click on Edit in action drop down by Datastore name     ${editedDatastoreName}
    Verify the field values for Datastore Name  ${editedDatastoreName}     none
    Verify the field values for SQL Datastore in Connection Settings    nl-bangalore1\SQLEXPRESS  sa  ea  2019sp2  uncheck
    Verify the field values for SQL Datastore in Data Settings    6  longname  id  5  {anglename:edited}  99  uncheck