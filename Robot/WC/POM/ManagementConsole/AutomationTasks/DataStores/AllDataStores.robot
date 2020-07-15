*** Variables ***
${trRowInAllDataStoresGrid}                   jquery=#DataStoresGrid > table > tbody > tr
${btnEditDataStores}                        .btnGroupContainer>.btn
${btnActionDataStores}                  .btnGroupInner .btnEdit
${btnActionDeleteDataStores}                .btnGroupInner .btnDelete

${btnAddNewDataStore}   xpath=//div[@id='mainContent']//a[@title='Datastore Plugins']
${menuAutomationTasks}   xpath=//div[@id='sideContent']/ul[@id='sideMenu']/li/a[@href='#/Automation tasks/']
${menuDatastores}   xpath=//div[@id='sideContent']/ul[@id='sideMenu']/li[@id='sideMenu-AutomationTasks']/ul[@id='sideMenu-AutomationTasks-childs']/li//a/span
${dpdDatastorePlugin}   xpath=//span[@aria-owns='DatastorePluginSelect_listbox']
#Delete Data Store
${btnSaveDeleteDataStore}               css=#popupConfirmation .btnSubmit
${btnDatastoreOptionSubmit}             css=.btnSubmit
${inputCountDatastoreDefaultCheckBox}        //img[@alt='Default Datastore']
${inputDatastoreDefaultCheckBox1}            //td[text()='
${inputDatastoreDefaultCheckBox2}            ']/following-sibling::td/img[@alt='Default Datastore']
${txtDefaultColumn}                          //a[text()='Default']
${trDatastoreName}                          //div[contains(@class, 'virtual-scrollable')]/descendant::tr[@role='row']/td[1]

*** Keywords ***
Count of Default Datastores
    ${count}        Get Element Count        ${inputCountDatastoreDefaultCheckBox}
    Should Be True  ${count} == 2

Default Checkbox For Default Datastores
    [Arguments]     ${DefaultDatastoreName}
    Page Should Contain Image     ${inputDatastoreDefaultCheckBox1}${DefaultDatastoreName}${inputDatastoreDefaultCheckBox2}

Sorting on Default Column    
    [Arguments]     ${expectedName1}    ${expectedName2}
    ${returnedDatastoresList}   Return Datastore List after Sorting
    ${actualName1}   Get From List   ${returnedDatastoresList}   0
    ${actualName2}   Get From List   ${returnedDatastoresList}   1
    Should Be Equal As Strings  ${actualName1}    ${expectedName1}
    Should Be Equal As Strings  ${actualName2}    ${expectedName2}
    ${returnedDatastoresList}   Return Datastore List after Sorting
    ${getLength}    Get Length    ${returnedDatastoresList}
    ${actualName3}   Get From List   ${returnedDatastoresList}   ${getLength-2}
    ${actualName4}   Get From List   ${returnedDatastoresList}   ${getLength-1}
    Should Be Equal As Strings  ${actualName3}    ${expectedName1}
    Should Be Equal As Strings  ${actualName4}    ${expectedName2}

Return Datastore List after Sorting
    Click Element   ${txtDefaultColumn}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${gridLoading}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    ${count}    Get Element Count   ${trDatastoreName}
    ${datastoresList}=    Create a List of String     ${trDatastoreName}
    [Return]    ${datastoresList}

Click Action On Data Stores By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trRowInAllDataStoresGrid}
    Wait Until Page Contains   Edit
    Wait Until Page Contains   Delete

Click Add Data Stores
    Click Element    ${btnAddNewDataStore}
    Wait Until Page Contains    Datastore Plugins

Click Edit Data Stores By Data Stores Name
    [Arguments]    ${dataStoresName}
    Click Action In Grid By Name     ${dataStoresName}    ${trRowInAllDataStoresGrid}    ${btnEditDataStores}
    Wait Until Page Contains    Connection settings
    Wait Until Page Contains    Data settings

Click Edit Data Stores Action By Data Stores Name
    [Arguments]    ${dataStoresName}
    Click Show Action Dropdown In Grid By Name    ${dataStoresName}    ${trRowInAllDataStoresGrid}

Click Edit Data Stores Action By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInAllDataStoresGrid}    ${btnEditDataStores}

Click Delete Data Stores Action By Data Stores Name
    [Arguments]    ${dataStoresName}
    Click Action In Grid By Name     ${dataStoresName}    ${trRowInAllDataStoresGrid}    ${btnActionDeleteDataStores}
    Wait Until Page Contains    Confirmation

Click Delete Data Stores Action By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInAllDataStoresGrid}    ${btnActionDeleteDataStores}

Confirm Delete Data Stores
    Wait Until Page Contains Element    ${btnSaveDeleteDataStore}
    Click Element    ${btnSaveDeleteDataStore}
    Wait MC Progress Bar Closed

Wait Datastores Page Ready
      Wait Until Page Contains    Datastores
      Wait Until Page Contains Element     ${btnAddNewDataStore}
      Wait MC Progress Bar Closed

Expand Automation Tasks tab
    Click Element   ${menuAutomationTasks}

Click on Datastores sub menu
    Wait Until Page Contains Element     ${menuDatastores}
    Click Element   ${menuDatastores}

Select Datastore Plugins option in popup
    [Arguments]     ${datastorePlugOption}
    Select Dropdown By InnerText  ${dpdDatastorePlugin}  ${datastorePlugOption}
    Click Element   ${btnDatastoreOptionSubmit}
    Wait Until Page Contains    Create new Datastore