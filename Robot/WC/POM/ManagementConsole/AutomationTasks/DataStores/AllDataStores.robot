*** Variables ***
${trRowInAllDataStoresGrid}                   jquery=#DataStoresGrid > table > tbody > tr
${btnEditDataStores}                        .btnGroupContainer>.btn
${btnActionDataStores}                  .btnGroupInner .btnEdit
${btnActionDeleteDataStores}                .btnGroupInner .btnDelete

${btnAddNewDataStore}     css=#mainContent > div > div.contentSection.contentSectionGrid > div.gridToolbar.gridToolbarBottom > a

#Delete Data Store
${btnSaveDeleteDataStore}               css=#popupConfirmation .btnSubmit

*** Keywords ***
Click Action On Data Stores By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trRowInAllDataStoresGrid}
    Wait Until Page Contains   Edit
    Wait Until Page Contains   Delete

Click Add Data Stores
    Click button     ${btnAddNewDataStore}
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